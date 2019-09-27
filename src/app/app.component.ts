import {Component, ElementRef, HostListener, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {NavigationStart, Router, UrlTree} from "@angular/router";
import {
    ActionSheetController,
    AlertController,
    Events, IonRouterOutlet,
    LoadingController, MenuController,
    ModalController,
    NavController,
    Platform, PopoverController,
    ToastController
} from '@ionic/angular';
import {AlertButton} from '@ionic/core';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {Device} from "@ionic-native/device/ngx";
import {AppVersion} from "@ionic-native/app-version/ngx";
import {Network} from "@ionic-native/network/ngx";
import {SecureStorage} from "@ionic-native/secure-storage/ngx";
import {Storage} from "@ionic/storage";
import {AES256} from "@ionic-native/aes-256/ngx";
import {Deeplinks} from "@ionic-native/deeplinks/ngx";


import {ConnectionStatusEvents, NetworkProvider} from "./utils/NetworkProvider";
import {SessionManager} from "./utils/SessionManager";
import {ToastType, Utils} from "./utils/Utils";
import {Api, ApiResponseType} from "./utils/Api";
import {Urls} from "./utils/Urls";
import {Langs, Strings} from "./resources";
import {Oauth, OauthGrantType} from "./utils/Oauth";
import {Crypt} from "./utils/Crypt";
import {NavigationOptions} from "@ionic/angular/dist/providers/nav-controller";

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {

    @ViewChild("loaderDiv") loadingScreen: ElementRef;
    @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;

    private static _oauth: Oauth;
    private static _instance: AppComponent;

    private toast;
    private loader;
    private alert;


    /*Defines whether or not
    the app has been completed loading or not*/
    public loaded: boolean = false;

    /*User Authorization*/
    public authAttempted: boolean = false;
    public authorized: boolean = false;

    /*If app was routed or was launched from home*/
    public routed = false;

    /*Current Navigated Page*/
    public currentPage:{id:number, url:string} = null;

    constructor(private platform: Platform,
                private router: Router,
                private deeplinks: Deeplinks,
                private navCtrl: NavController,
                private device: Device,
                private appVersion: AppVersion,
                private statusBar: StatusBar,
                public loadingCtrl: LoadingController,
                private toastCtrl: ToastController,
                private alertCtrl: AlertController,
                private splashScreen: SplashScreen,
                public modalCtrl: ModalController,
                private menu: MenuController,
                private actionSheetCtrl: ActionSheetController,
                private popoverCtrl: PopoverController,
                public events: Events,
                public network: Network,
                public aes256: AES256,
                public httpClient: HttpClient,
                public storage: Storage,
                public secureStorage: SecureStorage,
    ) {

        AppComponent._instance = this;

        /*Initialize Urls*/
        Urls.init();

        /*Initialize Oauth*/
        AppComponent._oauth = new Oauth({
            clientId: "ebusgh_partner",
            clientSecret: "LXL18eqUzw1dc0Ls2wXiZ2EJCMCh7fmL",
            authorizeUrl: Urls.oauthAuthorizeUrl,
            tokenUrl: Urls.oauthTokenUrl,
            verifyTokenUrl: Urls.oauthVerifyTokenUrl,
        });

        /*All set ready to go*/
        platform.ready().then(async () => {

            /*Register Back button event*/
            this.registerPopStateChanged();

            /*Initialize Encryption*/
            Crypt.init(this.aes256);

            /*Initialize Session Storage*/
            SessionManager.initialize(this);

            /*Initialize Network Provider*/
            await NetworkProvider.initialize(this);

            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            this.statusBar.styleDefault();
            this.splashScreen.hide();

            /*Offline event*/
            this.events.subscribe(ConnectionStatusEvents.Offline_Event, async () => {
                await this.showNotConnectedMsg();
            });

            /*Online event*/
            this.events.subscribe(ConnectionStatusEvents.Online_Event, async () => {

                //Dismiss Toast
                await this.hideToastMsg();

                //Authorize Access
                if (!this.authorized)
                    await this.authorize(true);
            });

            //Authorize Access
            await this.authorize(true);
        });
    }

    /**
     * Register Pop State changes
     */
    public registerPopStateChanged() {
        if (this.platform.is("cordova")) {
            this.platform.backButton.subscribe(async () => {
                await this.processPopState(true);
            });
        }
        else {
            this.router.events.subscribe(value => {
               if (value instanceof NavigationStart)  {
                   this.currentPage = {
                       id : value.id,
                       url : value.url,
                   }
               }
            });
            window.addEventListener('popstate', async (e) => {
                if (e.state != null && typeof e.state != 'undefined') {
                    await this.processPopState(false, e.state, this.currentPage);
                }
            });
        }
    }

    @HostListener('document:ionBackButton', ['$event'])
    private async overrideHardwareBackAction($event: any) {
        return await this.processPopState(true);
    }

    /**Process Pop State changes
     * @param backPressed
     * @param state
     * @param currentPage
     * @return {Promise<void>}
     */
    private async processPopState(backPressed?, state?, currentPage?:{id:number, url:string}) {

        // close action sheet
        if (this.actionSheetCtrl) {
            try {
                const element = await this.actionSheetCtrl.getTop();
                if (element) {
                    await element.dismiss();
                    if(!backPressed) {
                        if (state && state.navigationId !== currentPage.id)
                            await this.router.navigateByUrl(currentPage.url);
                    }
                    return;
                }
            } catch (error) {
            }
        }

        // close popover
        if (this.popoverCtrl) {
            try {
                const element = await this.popoverCtrl.getTop();
                if (element) {
                    await element.dismiss();
                    if(!backPressed) {
                        if (state && state.navigationId !== currentPage.id)
                            await this.router.navigateByUrl(currentPage.url);
                    }
                    return;
                }
            } catch (error) {}
        }

        // close modal
        if (this.modalCtrl) {
            try {
                const element = await this.modalCtrl.getTop();
                if (element) {
                    await element.dismiss();
                    if(!backPressed) {
                        if (state && state.navigationId !== currentPage.id)
                            await this.router.navigateByUrl(currentPage.url);
                    }
                    return;
                }
            } catch (error) {}
        }

        // close side menu
        if (this.menu) {
            try {
                const element = await this.menu.getOpen();
                if (element) {
                    await this.menu.close();
                    if(!backPressed) {
                        if (state && state.navigationId !== currentPage.id)
                            await this.router.navigateByUrl(currentPage.url);
                    }
                    return;
                }
            } catch (error) {}
        }

        if (backPressed) { //Go back
            if (this.routerOutlets) {
                this.routerOutlets.forEach(async (outlet: IonRouterOutlet) => {
                    if (outlet && outlet.canGoBack()) {
                        await outlet.pop();
                    }
                });
            }
        }
    }

    /**Get app instance*/
    public static get oauth(): Oauth {
        return AppComponent._oauth;
    }

    /**Get app instance*/
    public static get instance(): AppComponent {
        return AppComponent._instance;
    }

    /**Set RootPage*/
    public async setRootPage(url: string | UrlTree | any[], options?: NavigationOptions) {
        options = options || {};
        options.replaceUrl = true;
        await this.navCtrl.navigateRoot(url, options).then(value => {
            if (!value){
                return this.navCtrl.navigateRoot("/home");
            }
            return value
        });
    }

    /**Hide Initial Loading screen*/
    public hideLoadingScreen() {
        this.loaded = true;
        this.loadingScreen.nativeElement.style.display = "none";
    }

    /**No Internet Connection Message
     * @param onDismiss closure
     * */
    public showNotConnectedMsg(onDismiss?: (data: any, role: string) => any) {
        return this.showToastMsg(Strings.getString("error_connection"),
            ToastType.ERROR,
            86400 * 1000,
            true,
            Utils.assertAvailable(onDismiss) ?
                Strings.getString("retry_txt") :
                Strings.getString("close_txt"),
            onDismiss);
    }

    /**Toast Message
     * @param msg String
     * @param type Number
     * @param duration Number
     * @param showCloseButton boolean
     * @param closeButton
     * @param onDismiss closure
     * @param position String
     * */
    public async showToastMsg(msg: string,
                              type: ToastType,
                              duration: number = 6000,
                              showCloseButton: boolean = false,
                              closeButton: string = Utils.convertHTMLEntity("&times;"),
                              onDismiss?: (data: any, role: string) => any,
                              position: 'bottom' | 'top' = 'bottom') {
        await this.hideToastMsg();
        this.toast = await this.toastCtrl.create({
            message: msg,
            duration: duration,
            cssClass: type,
            showCloseButton: showCloseButton,
            closeButtonText: closeButton,
            keyboardClose: true,
            position: position
        });
        this.toast.onDidDismiss().then((data, role) => {
            if (onDismiss)
                onDismiss(data, role);
        });
        return await this.toast.present();
    }

    /**Hide Toast Messages
     * */
    public async hideToastMsg() {
        if (this.toast != null)
            return this.toast.dismiss();
        return null;
    }

    /**Show Loading Dialog
     * @param msg String
     * */
    public async showLoading(msg: string = Strings.getString("please_wait")) {
        await this.hideLoading();
        this.loader = await this.loadingCtrl.create({
            message: msg,
            showBackdrop: true,
            spinner: "circles",
            animated: true,
            keyboardClose: true,
        });
        return await this.loader.present()
    }

    /**Hide Loading Dialog
     * */
    public async hideLoading() {
        if (this.loader != null)
            return this.loader.dismiss();
        return null;
    }

    /**Show Alert dialog*/
    public async showAlert(title?: string,
                           message?: string,
                           primaryBt?: {
                               title: string,
                               callback?: (data?: any) => any
                           },
                           secondaryBt?: {
                               title: string,
                               callback?: (data?: any) => any
                           }) {

        await this.hideAlert();
        let buttons: AlertButton[] = [];

        if (Utils.assertAvailable(primaryBt)) {
            buttons.push({
                text: primaryBt.title,
                handler: primaryBt.callback,
            })
        }
        if (Utils.assertAvailable(secondaryBt)) {
            buttons.push({
                text: secondaryBt.title,
                handler: secondaryBt.callback,
            })
        }

        this.alert = await this.alertCtrl.create({
            header: title,
            message: message,
            buttons: buttons
        });
        return await this.alert.present();
    }

    /**Hide Alert dialogs*/
    public async hideAlert() {
        if (this.alert != null)
            return this.alert.dismiss();
        return null;
    }


    /**Authorize User Check
     * and verify token if existing
     * */
    public authorize(redirect = false, reattempt = false): Promise<boolean> {
        return new Promise((resolve: (status: boolean) => any) => {
            if (!this.authAttempted || reattempt) {
                this.authAttempted = true;
                console.log("Auth attempted - redirect = " + redirect + " reattempt = " + reattempt);
                NetworkProvider.checkConnection(async connected => {
                    if (connected) {
                        AppComponent.oauth.authorizeAccess({
                            scope: ['agent'],
                            grant_type: OauthGrantType.Auto,
                            ignore_grant_types: [
                                OauthGrantType.Client_Credentials
                            ],
                            state: Utils.getCurrentInstance(),
                            callback: async (token, msg) => {
                                if (token) {
                                    await this.validate_session(async (status, msg, responseType) => {
                                        if (status) {
                                            this.authorized = true;
                                            if (redirect) {
                                                if (!this.platform.is('cordova')
                                                    && Utils.assertAvailable(Utils.stripUrlParams(this.router.url))
                                                    && Utils.stripUrlParams(this.router.url) != '/') {
                                                    try {
                                                        this.routed = true;
                                                        await this.setRootPage(this.router.url);
                                                    } catch (e) {
                                                        this.routed = false;
                                                        await this.setRootPage("/home");
                                                    }
                                                }
                                                else {
                                                    this.routed = false;
                                                    await this.setRootPage("/home");
                                                }
                                            }
                                            this.hideLoadingScreen();
                                        }
                                        else {
                                            this.authorized = false;
                                            if (Utils.assertAvailable(msg)) {
                                                await this.showToastMsg(msg, ToastType.ERROR);
                                            }
                                            await SessionManager.logout();
                                        }
                                        resolve(status);
                                    });
                                }
                                else {
                                    this.authorized = false;
                                    if (Utils.assertAvailable(msg)) {
                                        await this.showToastMsg(msg, ToastType.ERROR);
                                    }
                                    await SessionManager.logout();
                                    resolve(false);
                                }
                            }
                        });
                    }
                    else {
                        await this.showNotConnectedMsg(async () => {
                            await this.authorize(redirect, reattempt);
                        });
                        resolve(false);
                    }
                });
            }
        })
    }

    /**Validate existing session, or create one
     * */
    public async validate_session(callback?: (status: boolean, msg: string, responseType: ApiResponseType) => any) {

        let appVersion = await this.appVersion.getVersionNumber()
            .then(value => {
                return value
            })
            .catch(() => {
                return null
            });
        let appName = await this.appVersion.getAppName()
            .then(value => {
                return value
            })
            .catch(() => {
                return null
            });
        let userAgent = this.platform.is("android") ?
            "Android" :
            this.platform.is("ios") ?
                "IOS" :
                this.platform.is("desktop") ?
                    "Desktop" :
                    "Unknown";

        let deviceType = this.platform.is("mobile") ?
            "Phone" :
            this.platform.is("tablet") ?
                "Tablet" :
                this.platform.is("desktop") ?
                    "Computer" :
                    "Unknown";

        let os = Utils.assertAvailable(this.device.platform) &&
        Utils.assertAvailable(this.device.version) ?
            this.device.platform + " " + this.device.version : null;

        let deviceModel = Utils.assertAvailable(this.device.manufacturer) &&
        Utils.assertAvailable(this.device.model) ?
            this.device.manufacturer + " " + this.device.model :
            Utils.assertAvailable(this.device.manufacturer) ?
                this.device.manufacturer :
                null;

        Api.validateSession({
            agent: userAgent,
            os: os,
            version: appVersion,
            app_name: appName,
            device_type: deviceType,
            device_name: deviceModel,
        }, (status, result, responseType) => {
            if (status) {
                //Save  session info
                if (Utils.assertAvailable(result)) {
                    SessionManager.setSession(result, done => {
                        if (done) {
                            //Get user info
                            this.get_user_info(callback);
                        }
                        else {
                            if (Utils.assertAvailable(callback)) {
                                callback(done, Strings.getString("error_unexpected"), responseType);
                            }
                        }
                    });
                }
                else {
                    if (Utils.assertAvailable(callback)) {
                        callback(false, Strings.getString("error_unexpected"), responseType);
                    }
                }
            }
            else {
                if (Utils.assertAvailable(callback)) {
                    callback(status, result, responseType);
                }
            }
        });

    }

    /**Get User Data*/
    public get_user_info(callback?: (status: boolean, msg: string, responseType: ApiResponseType) => any) {
        Api.getUserInfo((status, result, responseType) => {
            if (status) {

                //Save user data to session
                if (Utils.assertAvailable(result)) {
                    SessionManager.setUserInfo(result.data, done => {
                        if (done) {
                            //Set app's Language with user's
                            if (Utils.assertAvailable(result.data.lang)) {
                                let key = result.data.lang.toUpperCase();
                                if (Langs[key]) {
                                    Strings.setLanguage(key);
                                }
                            }
                            if (Utils.assertAvailable(callback)) {
                                callback(done, result, responseType);
                            }
                        }
                        else {
                            if (Utils.assertAvailable(callback)) {
                                callback(done, Strings.getString("error_unexpected"), responseType);
                            }
                        }
                    });
                }
                else {
                    if (Utils.assertAvailable(callback)) {
                        callback(false, Strings.getString("error_unexpected"), responseType);
                    }
                }
            }
            else {
                if (Utils.assertAvailable(callback)) {
                    callback(status, result, responseType);
                }
            }
        });
    }
}
