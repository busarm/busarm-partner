import {Component, ElementRef, HostListener, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NavigationStart, Router, UrlTree} from '@angular/router';
import {
    ActionSheetController,
    AlertController,
    IonRouterOutlet,
    LoadingController, MenuController,
    ModalController,
    NavController,
    Platform, PopoverController,
    ToastController
} from '@ionic/angular';
import {AlertButton} from '@ionic/core';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {Device} from '@ionic-native/device/ngx';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {Network} from '@ionic-native/network/ngx';
import {SecureStorage} from '@ionic-native/secure-storage/ngx';
import {Storage} from '@ionic/storage';
import {AES256} from '@ionic-native/aes-256/ngx';
import {Deeplinks} from '@ionic-native/deeplinks/ngx';


import {NetworkProvider} from './services/NetworkProvider';
import {SessionManager} from './libs/SessionManager';
import {ToastType, Utils} from './libs/Utils';
import {Api, ApiResponseType} from './libs/Api';
import {Urls} from './libs/Urls';
import {Langs, Strings} from './resources';
import {Oauth, OauthGrantType, OauthUtils, OauthStorage} from './libs/Oauth';
import {CIPHER} from './libs/CIPHER';
import { environment } from '../environments/environment';
import { Events } from './services/Events';
import { NavigationOptions } from '@ionic/angular/dist/providers/nav-controller';
// import { NavigationOptions } from '@ionic/angular/providers/nav-controller';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {

    constructor(public platform: Platform,
                public router: Router,
                public deeplinks: Deeplinks,
                public navCtrl: NavController,
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
            clientId: 'wecari_partner_app_M4NgNbnsCy',
            clientSecret: '2627b1c45ef96be17b7a3de1cd4d3bad5172b1381f2b2100e41edebc68ec42e9',
            authorizeUrl: Urls.oauthAuthorizeUrl,
            tokenUrl: Urls.oauthTokenUrl,
            verifyTokenUrl: Urls.oauthVerifyTokenUrl
        });

        /*All set ready to go*/
        platform.ready().then(async () => {

            /*Register Back button event*/
            this.registerPopStateChanged();

            /*Initialize Encryption*/
            CIPHER.init(this);

            /*Initialize Session Storage*/
            SessionManager.initialize(this);

            /*Initialize Network Provider*/
            await NetworkProvider.initialize(this);

            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            this.statusBar.styleDefault();
            this.splashScreen.hide();

            /*Network event*/
            this.events.getNetworkObservable().subscribe(async (online) => {
                if (online) {
                    await this.hideToastMsg();
                } else {
                    await this.showNotConnectedMsg();
                }
            });
        });
    }

    /**Get app instance*/
    public static get oauth(): Oauth {
        return AppComponent._oauth;
    }

    /**Get app instance*/
    public static get instance(): AppComponent {
        return AppComponent._instance;
    }

    private static _oauth: Oauth;
    private static _instance: AppComponent;

    @ViewChild('loaderDiv') loadingScreen: ElementRef;
    @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;

    private toast;
    private loader;
    private alert;


    /*Defines whether or not
    the app has been completed loading or not*/
    public loaded = false;

    /*User Authorization*/
    public authAttempted = false;
    public authorized = false;

    /*Current Navigated Page*/
    public currentPage: {id: number, url: string} = null;

    /**
     * Register Pop State changes
     */
    public registerPopStateChanged() {
        if (this.platform.is('cordova')) {
            this.platform.backButton.subscribe(async () => {
                await this.processPopState(true);
            });
        } else {
            this.router.events.subscribe(value => {
               if (value instanceof NavigationStart)  {
                   this.currentPage = {
                       id : value.id,
                       url : value.url,
                   };
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
    private async processPopState(backPressed?, state?, currentPage?: {id: number, url: string}) {

        // close action sheet
        if (this.actionSheetCtrl) {
            try {
                const element = await this.actionSheetCtrl.getTop();
                if (element) {
                    await element.dismiss();
                    if (!backPressed) {
                        if (state && state.navigationId !== currentPage.id) {
                            await this.router.navigateByUrl(currentPage.url);
                        }
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
                    if (!backPressed) {
                        if (state && state.navigationId !== currentPage.id) {
                            await this.router.navigateByUrl(currentPage.url);
                        }
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
                    if (!backPressed) {
                        if (state && state.navigationId !== currentPage.id) {
                            await this.router.navigateByUrl(currentPage.url);
                        }
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
                    if (!backPressed) {
                        if (state && state.navigationId !== currentPage.id) {
                            await this.router.navigateByUrl(currentPage.url);
                        }
                    }
                    return;
                }
            } catch (error) {}
        }

        if (backPressed) { // Go back
            if (this.routerOutlets) {
                this.routerOutlets.forEach(async (outlet: IonRouterOutlet) => {
                    if (outlet && outlet.canGoBack()) {
                        await outlet.pop();
                    }
                });
            }
        }
    }

    /**Set RootPage*/
    public async setRootPage(url: string | UrlTree | any[], options?: NavigationOptions) {
        options = options || {};
        options.replaceUrl = true;
        await this.navCtrl.navigateRoot(url, options).then(value => {
            return value;
        }).catch((err) => {
            return this.navCtrl.navigateRoot('home', options);
        });
    }


    /**Set RootPage to home page*/
    public async goHome(options?: NavigationOptions) {
        await this.setRootPage('home', options);
    }

    /**Set RootPage to login page*/
    public async goToLogin(options?: NavigationOptions) {
        await this.setRootPage('login', options);
    }

    /**Hide Initial Loading screen*/
    public hideLoadingScreen() {
        this.loaded = true;
        this.loadingScreen.nativeElement.style.display = 'none';
    }

    /**No Internet Connection Message
     * @param onDismiss closure
     * */
    public showNotConnectedMsg(onDismiss?: (data: any, role: string) => any) {
        return this.showToastMsg(Strings.getString('error_connection'),
            ToastType.ERROR,
            86400 * 1000,
            true,
            Utils.assertAvailable(onDismiss) ?
                Strings.getString('retry_txt') :
                Strings.getString('close_txt'),
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
                              closeButton: string = Utils.convertHTMLEntity('&times;'),
                              onDismiss?: (data: any, role: string) => any,
                              position: 'bottom' | 'top' = 'bottom') {
        await this.hideToastMsg();
        this.toast = await this.toastCtrl.create({
            message: Utils.convertHTMLEntity(msg),
            duration: duration,
            cssClass: type,
            buttons: showCloseButton ? [
                {
                    text: closeButton,
                    side: 'end',
                    role: 'cancel'
                }
            ] : [],
            keyboardClose: true,
            position: position
        });
        this.toast.onDidDismiss().then((data, role) => {
            if (onDismiss) {
                onDismiss(data, role);
            }
        });
        return await this.toast.present();
    }

    /**Hide Toast Messages
     * */
    public async hideToastMsg() {
        if (this.toast != null) {
            return this.toast.dismiss();
        }
        return null;
    }

    /**Show Loading Dialog
     * @param msg String
     * */
    public async showLoading(msg: string = Strings.getString('please_wait')) {
        await this.hideLoading();
        this.loader = await this.loadingCtrl.create({
            message: Utils.convertHTMLEntity(msg),
            showBackdrop: true,
            spinner: 'circles',
            animated: true,
            keyboardClose: true,
        });
        return await this.loader.present();
    }

    /**Hide Loading Dialog
     * */
    public async hideLoading() {
        if (this.loader != null) {
            return this.loader.dismiss();
        }
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
        const buttons: AlertButton[] = [];

        if (Utils.assertAvailable(primaryBt)) {
            buttons.push({
                text: primaryBt.title,
                handler: primaryBt.callback,
            });
        }
        if (Utils.assertAvailable(secondaryBt)) {
            buttons.push({
                text: secondaryBt.title,
                handler: secondaryBt.callback,
            });
        }

        this.alert = await this.alertCtrl.create({
            header: title,
            message: Utils.convertHTMLEntity(message),
            buttons: buttons
        });
        return await this.alert.present();
    }

    /**Hide Alert dialogs*/
    public async hideAlert() {
        if (this.alert != null) {
            return this.alert.dismiss();
        }
        return null;
    }


    /**Authorize User Check
     * and verify token if existing
     * */
    public authorize(reattempt: boolean = false): Promise<boolean> {
        return new Promise(async (resolve: (status: boolean) => any) => {
            if (!this.authAttempted || reattempt) {
                this.authAttempted = true;
                NetworkProvider.checkConnection(async connected => {
                    if (connected) {
                        AppComponent.oauth.authorizeAccess({
                            scope: ['agent'],
                            grant_type: OauthGrantType.Auto,
                            state: await Utils.getCurrentInstance(),
                            callback: async (token, msg) => {
                                if (token) {  // Token Available
                                    await this.validate_session(async (status, msg, responseType) => {
                                        if (status) {
                                            resolve(true);
                                            this.authorized = true;
                                        } else {
                                            this.authorized = false;
                                            switch (responseType) {
                                                case ApiResponseType.Authorization_error:
                                                    await this.showToastMsg(msg,
                                                        ToastType.ERROR,
                                                        86400 * 1000,
                                                        true,
                                                        Strings.getString('retry_txt') ,
                                                        () => {
                                                            this.authorize(true).then(status => {
                                                                resolve (status);
                                                            }).catch(() => {
                                                                resolve(false);
                                                            });
                                                        });
                                                    break;
                                                default:
                                                    this.authAttempted = false;
                                                    this.authorized = false;
                                                    if (Utils.assertAvailable(msg)) { await this.showToastMsg(msg, ToastType.ERROR); }
                                                    resolve(false);
                                            }
                                        }
                                        this.hideLoadingScreen();
                                    });
                                } else { // Failed ot get token
                                    this.authAttempted = false;
                                    this.authorized = false;
                                    if (Utils.assertAvailable(msg)) { await this.showToastMsg(msg, ToastType.ERROR); }
                                    resolve(false);
                                    this.hideLoadingScreen();
                                }
                            }
                        });
                    } else {  // No internet connection
                        this.authAttempted = false;
                        this.showNotConnectedMsg(async () => {
                            this.authorize(true).then(status => {
                                resolve (status);
                            }).catch(() => {
                                resolve(false);
                            });
                        });
                        this.hideLoadingScreen();
                    }
                });
            } else {
                resolve(this.authorized && !OauthUtils.hasTokenExpired());
                this.hideLoadingScreen();
            }
        });
    }

    /**Validate existing session, or create one
     * */
    public async validate_session(callback?: (status: boolean, msg: string, responseType: ApiResponseType) => any) {

        const appVersion = await this.appVersion.getVersionNumber()
            .then(value => {
                return value;
            })
            .catch(() => {
                return environment.app_version;
            });
        const appName = await this.appVersion.getAppName()
            .then(value => {
                return value;
            })
            .catch(() => {
                return environment.app_name;
            });

        const platform = this.platform.is('android') ?
            'Android' :
            this.platform.is('ios') ?
                'IOS' :
                this.platform.is('desktop') ?
                    'Desktop' :
                    'Unknown';

        const deviceType = this.platform.is('mobile') ?
            'Phone' :
            this.platform.is('tablet') ?
                'Tablet' :
                this.platform.is('desktop') ?
                    'Computer' :
                    'Unknown';

        const os = Utils.assertAvailable(this.device.platform) &&
        Utils.assertAvailable(this.device.version) ?
            this.device.platform + ' ' + this.device.version : platform;

        const deviceModel = Utils.assertAvailable(this.device.manufacturer) &&
        Utils.assertAvailable(this.device.model) ?
            this.device.manufacturer + ' ' + this.device.model :
            Utils.assertAvailable(this.device.manufacturer) ?
                this.device.manufacturer :
                null;

        Api.initialize({
            os: os,
            version: appVersion,
            app_name: appName,
            device_type: deviceType,
            device_name: deviceModel,
        }, (status, result, responseType) => {

            if (status) {
                if (Utils.assertAvailable(result)) {
                    if (result.status) {
                        // Save  session info
                        SessionManager.setSession(result, done => {
                            if (done) {
                                // Get user info
                                this.get_user_info(callback);
                            } else {
                                if (Utils.assertAvailable(callback)) {
                                    callback(done, Strings.getString('error_unexpected'), responseType);
                                }
                            }
                        });
                    } else {

                        if (Utils.assertAvailable(callback)) {
                            callback(false, result.msg ? result.msg : Strings.getString('error_unexpected'), responseType);
                        }
                    }
                } else {
                    if (Utils.assertAvailable(callback)) {
                        callback(false, Strings.getString('error_unexpected'), responseType);
                    }
                }
            } else {
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
                if (Utils.assertAvailable(result)) {
                    if (result.status) {
                        // Save user data to session
                        SessionManager.setUserInfo(result.data, done => {
                            if (done) {
                                // Set app's Language with user's
                                if (Utils.assertAvailable(result.data.lang)) {
                                    const key = result.data.lang.toUpperCase();
                                    if (Langs[key]) { // If Language Supported
                                        Strings.setLanguage(key);
                                    }
                                }
                                if (Utils.assertAvailable(callback)) {
                                    callback(done, result, responseType);
                                }
                            } else {
                                if (Utils.assertAvailable(callback)) {
                                    callback(done, Strings.getString('error_unexpected'), responseType);
                                }
                            }
                        });
                    } else {
                        if (Utils.assertAvailable(callback)) {
                            callback(false, result.msg ? result.msg : Strings.getString('error_unexpected'), responseType);
                        }
                    }
                } else {
                    if (Utils.assertAvailable(callback)) {
                        callback(false, Strings.getString('error_unexpected'), responseType);
                    }
                }
            } else {
                if (Utils.assertAvailable(callback)) {
                    callback(status, result, responseType);
                }
            }
        });
    }

    /**Set Country
     * @param {string} country_code
     * @param {(status: boolean, msg: string, responseType: ApiResponseType) => any} callback
     */
    public set_country(country_code: string, callback?: (status: boolean, msg: string, responseType: ApiResponseType) => any) {
        Api.setCountry(country_code, (status, result, responseType) => {
            if (status) {
                this.validate_session(callback);
            } else {
                if (Utils.assertAvailable(callback)) {
                    callback(status, result, responseType);
                }
            }
        });
    }

    /**Set Language
     * @param {string} language_code
     * @param {(status: boolean, msg: string, responseType: ApiResponseType) => any} callback
     */
    public set_language(language_code: string, callback?: (status: boolean, msg: string, responseType: ApiResponseType) => any) {
        Api.setLanguage(language_code, (status, result, responseType) => {
            if (status) {
                this.validate_session(callback);
            } else {
                if (Utils.assertAvailable(callback)) {
                    callback(status, result, responseType);
                }
            }
        });
    }
}
