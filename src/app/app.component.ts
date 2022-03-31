import {
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { NavigationStart, Router, UrlTree } from "@angular/router";
import {
  ActionSheetController,
  AlertController,
  IonRouterOutlet,
  LoadingController,
  MenuController,
  ModalController,
  NavController,
  Platform,
  PopoverController,
  ToastController,
} from "@ionic/angular";
import { AlertButton } from "@ionic/core";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { Device } from "@ionic-native/device/ngx";
import { AppVersion } from "@ionic-native/app-version/ngx";
import { Network } from "@ionic-native/network/ngx";
import { SecureStorage } from "@ionic-native/secure-storage/ngx";
import { Storage } from "@ionic/storage";
import { AES256 } from "@ionic-native/aes-256/ngx";
import { Deeplinks } from "@ionic-native/deeplinks/ngx";

import { NetworkProvider } from "./services/app/NetworkProvider";
import { SessionManager } from "./helpers/SessionManager";
import { ToastType, Utils } from "./helpers/Utils";
import { Api, ApiResponseType } from "./helpers/Api";
import { Urls } from "./helpers/Urls";
import { Langs, Strings } from "./resources";
import { Oauth, OauthGrantType, OauthUtils } from "./helpers/Oauth";
import { CIPHER } from "./helpers/CIPHER";
import { ENVIRONMENT, CONFIGS } from "../environments/environment";
import { Events } from "./services/app/Events";
import { NavigationOptions } from "@ionic/angular/providers/nav-controller";
import { PingResponse } from "./models/PingResponse";
import { Session } from "./models/Session";
import { ENV } from "../environments/ENV";
import { SwUpdate } from "@angular/service-worker";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
})
export class AppComponent {
  public strings = Strings;

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

  @ViewChild("loaderDiv") loadingScreen: ElementRef;
  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;

  private toast: any;
  private loader: any;
  private alert: any;

  /*Defines whether or not
    the app has been completed loading or not*/
  public showEnvironmentBanner = ENVIRONMENT != ENV.PROD;

  /*Defines whether or not
    the app has been completed loading or not*/
  public loaded = false;

  /*User Authorization*/
  public authAttempted = false;
  public authorized = false;

  /*Current Navigated Page*/
  public currentPage: { id: number; url: string } = null;

  constructor(
    private swUpdate: SwUpdate,
    public platform: Platform,
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
    public networkProvider: NetworkProvider
  ) {

    AppComponent._instance = this;

    // Initialize Session Storage
    SessionManager.initialize(this);

    // Initialize Oauth
    AppComponent._oauth = new Oauth({
      clientId: CONFIGS.oauth_client_id,
      clientSecret: CONFIGS.oauth_client_secret,
      authorizeUrl: Urls.oauthAuthorizeUrl,
      tokenUrl: Urls.oauthTokenUrl,
      verifyTokenUrl: Urls.oauthVerifyTokenUrl,
    });

    // Subscribe to network changes
    networkProvider.initializeNetworkEvents();

    // Set up dark mode using system setting if not signed in
    let systemDark = window.matchMedia("(prefers-color-scheme: dark)");
    if (!this.authorized && AppComponent._oauth.hasExpired()) {
      SessionManager.setDarkMode(systemDark.matches);
      document.body.classList.toggle('dark', systemDark.matches)
    }
    else {
      SessionManager.getDarkMode().then(enabled => {
        document.body.classList.toggle('dark', enabled)
      })
    }

    // Listen to system changes
    systemDark.onchange = (sys) => {
      if (!this.authorized && AppComponent._oauth.hasExpired()) {
        SessionManager.setDarkMode(sys.matches);
        document.body.classList.toggle('dark', sys.matches)
        events.darkModeChange.emit(sys.matches);
      }
    };

    // Subscribe to any updates
    this.subscribeToUpdates();

    // All set ready to go
    platform.ready().then(async () => {

      // Register Back button event
      this.registerPopStateChanged();

      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      // Network event
      this.events.networkChange.subscribe(async (online) => {
        if (online) {
          await this.hideToastMsg();
        } else {
          await this.showNotConnectedMsg();
        }
      });
    });
  }

  /**Get app environment*/
  get environment() {
    return ENVIRONMENT;
  }

  /**Get live url*/
  get liveUrl(): String {
    return Urls.baseUrl(ENV.PROD);
  }

  /**Subscribe to any updates */
  private subscribeToUpdates(): void {
    if (this.swUpdate.available) {
      this.swUpdate.available.subscribe(() => {
        this.showAlert(
          Strings.getString("update_available_title"),
          Strings.getString("update_available_msg"),
          {
            title: Strings.getString("no_txt"),
          },
          {
            title: Strings.getString("yes_txt"),
            callback: () => {
              window.location.reload();
            },
          }
        );
      });
    }
  }

  /**Get Ping Status
   * @return {PingResponse}
   */
  public async getPingStatus() {
    return await new Promise<PingResponse>(
      (resolve: (data: PingResponse) => any) => {
        SessionManager.getPing((data) => {
          if (data) {
            resolve(data);
          } else {
            resolve(null);
          }
        });
      }
    );
  }

  /**
   * Register Pop State changes
   */
  public registerPopStateChanged() {
    if (this.platform.is("cordova") || this.platform.is("capacitor")) {
      // Back button press listner - before action
      this.platform.backButton.subscribe(async () => {
        await this.processPopState(true);
      });
    } else {
      // Popstate Event - after action
      this.router.events.subscribe((value) => {
        if (value instanceof NavigationStart) {
          this.currentPage = {
            id: value.id,
            url: value.url,
          };
        }
      });
      window.addEventListener("popstate", async (e) => {
        if (e.state != null && typeof e.state != "undefined") {
          await this.processPopState(false, e.state, this.currentPage);
        }
      });
    }
  }

  /**Process Pop State changes
   * @param backPressed
   * @param state
   * @param currentPage
   * @return {Promise<void>}
   */
  private async processPopState(
    backPressed?,
    state?,
    currentPage?: { id: number; url: string }
  ) {
    // close action sheet
    if (this.actionSheetCtrl) {
      try {
        const element = await this.actionSheetCtrl.getTop();
        if (element) {
          await element.dismiss();
          if (!backPressed && state && state.navigationId !== currentPage.id) {
            await this.router.navigateByUrl(currentPage.url);
          }
          return;
        }
      } catch (error) { }
    }

    // close popover
    if (this.popoverCtrl) {
      try {
        const element = await this.popoverCtrl.getTop();
        if (element) {
          await element.dismiss();
          if (!backPressed && state && state.navigationId !== currentPage.id) {
            await this.router.navigateByUrl(currentPage.url);
          }
          return;
        }
      } catch (error) { }
    }

    // close modal
    if (this.modalCtrl) {
      try {
        const element = await this.modalCtrl.getTop();
        if (element) {
          await element.dismiss();
          if (!backPressed && state && state.navigationId !== currentPage.id) {
            await this.router.navigateByUrl(currentPage.url);
          }
          return;
        }
      } catch (error) { }
    }

    // close side menu
    if (this.menu) {
      try {
        const element = await this.menu.getOpen();
        if (element) {
          await this.menu.close();
          if (!backPressed && state && state.navigationId !== currentPage.id) {
            await this.router.navigateByUrl(currentPage.url);
          }
          return;
        }
      } catch (error) { }
    }

    // Go back
    if (backPressed && this.routerOutlets) {
      this.routerOutlets.forEach(async (outlet: IonRouterOutlet) => {
        if (outlet && outlet.canGoBack()) {
          await outlet.pop();
        }
      });
    }
  }

  /**Set RootPage*/
  public async setRootPage(
    url: string | UrlTree | any[],
    options?: NavigationOptions
  ) {
    options = options || {};
    options.replaceUrl = true;
    await this.navCtrl
      .navigateRoot(url, options)
      .then((value) => {
        return value;
      })
      .catch((err) => {
        return this.navCtrl.navigateRoot("home", options);
      });
  }

  /**Set RootPage to home page*/
  public async goHome(options?: NavigationOptions) {
    await this.setRootPage("home", options);
  }

  /**Set RootPage to login page*/
  public async goToLogin(options?: NavigationOptions) {
    await this.setRootPage("login", options);
  }

  /**Hide Initial Loading screen*/
  public hideLoadingScreen() {
    setTimeout(() => {
      this.loaded = true;
      this.loadingScreen.nativeElement.style.display = "none";
    }, 1000);
  }

  /**No Internet Connection Message
   * @param onDismiss closure
   * */
  public showNotConnectedMsg(onDismiss?: (data: any, role: string) => any) {
    return this.showToastMsg(
      Strings.getString("error_connection"),
      ToastType.ERROR,
      86400 * 1000,
      true,
      Utils.assertAvailable(onDismiss)
        ? Strings.getString("retry_txt")
        : Strings.getString("close_txt"),
      onDismiss
    );
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
  public async showToastMsg(
    msg: string,
    type: ToastType,
    duration: number = 6000,
    showCloseButton: boolean = false,
    closeButton: string = Utils.convertHTMLEntity("&times;"),
    onDismiss?: (data: any, role: string) => any,
    position: "bottom" | "top" = "bottom"
  ) {
    await this.hideToastMsg();
    this.toast = await this.toastCtrl.create({
      message: Utils.convertHTMLEntity(msg),
      duration: duration,
      cssClass: type,
      buttons: showCloseButton
        ? [
          {
            text: closeButton,
            side: "end",
            role: "cancel",
          },
        ]
        : [],
      keyboardClose: true,
      position: position,
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
   * */
  public async showLoading({
    msg = Strings.getString("please_wait"),
    backdropDismiss = false,
    showBackdrop = true,
  }) {
    await this.hideLoading();
    this.loader = await this.loadingCtrl.create({
      message: msg ? Utils.convertHTMLEntity(msg) : null,
      showBackdrop,
      spinner: msg ? "crescent" : "dots",
      animated: true,
      keyboardClose: true,
      backdropDismiss,
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
  public async showAlert(
    title?: string,
    message?: string,
    primaryBt?: {
      title: string;
      callback?: (data?: any) => any;
    },
    secondaryBt?: {
      title: string;
      callback?: (data?: any) => any;
    }
  ) {
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
      buttons: buttons,
      backdropDismiss: !(primaryBt || secondaryBt),
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

  /**
   * Authorize User Check
   * and verify token if existing
   * @param {Boolean} force
   * @returns {Promise<boolean>}
   */
  public authorize(force: boolean = false): Promise<boolean> {
    return new Promise(async (resolve: (status: boolean) => any) => {
      if ((!this.authorized && !this.authAttempted) || force) {
        // Check internet connection
        this.networkProvider.checkConnection(async (connected) => {
          if (connected) {
            // To prevent duplicate request
            this.authAttempted = true;
            // Authorize
            AppComponent.oauth.authorizeAccess({
              scope: CONFIGS.oauth_scopes,
              grant_type: OauthGrantType.Auto,
              state: Utils.getCurrentSignature(await this.getPingStatus()),
              callback: async (token, msg) => {
                if (token) {
                  // Validate Session
                  await this.validateSession(
                    async (status, msg, responseType) => {
                      if (status) {
                        this.authorized = true;
                        this.authAttempted = false;
                        this.hideLoadingScreen();
                        resolve(true);
                      } else {
                        this.authAttempted = false;
                        switch (responseType) {
                          case ApiResponseType.Authorization_error:
                            this.authorized = false;
                            await this.showToastMsg(
                              msg,
                              ToastType.ERROR,
                              86400 * 1000,
                              true,
                              Strings.getString("retry_txt"),
                              () => {
                                this.authorize(true)
                                  .then((status) => {
                                    resolve(status);
                                  })
                                  .catch(() => {
                                    resolve(false);
                                  });
                              }
                            );
                            break;
                          default:
                            // Check if session info available
                            SessionManager.getSession(async (session) => {
                              if (session) {
                                this.authorized = true;
                                this.hideLoadingScreen();
                                resolve(true);
                              } else {
                                this.authorized = false;
                                if (Utils.assertAvailable(msg)) {
                                  await this.showToastMsg(msg, ToastType.ERROR);
                                }
                                this.hideLoadingScreen();
                                resolve(false);
                              }
                            });
                        }
                      }
                    }
                  );
                } else {
                  // Failed to get token
                  this.authAttempted = false;
                  this.authorized = false;
                  if (Utils.assertAvailable(msg)) {
                    await this.showToastMsg(msg, ToastType.ERROR);
                  }
                  this.hideLoadingScreen();
                  resolve(false);
                }
              },
            });
          } else {
            // Check if Authorization exists and hasn't expired
            if (!AppComponent.oauth.hasExpired()) {
              // Check if session info available
              SessionManager.getSession((session) => {
                if (session) {
                  this.authorized = true;
                  this.hideLoadingScreen();
                  resolve(true);
                } else {
                  this.showNotConnectedMsg(async () => {
                    this.authorize(true)
                      .then((status) => {
                        resolve(status);
                      })
                      .catch(() => {
                        resolve(false);
                      });
                  });
                }
              });
            } else {
              this.authorized = false;
              this.hideLoadingScreen();
              resolve(false);
            }
          }
        });
      } else {
        resolve(this.authorized && !AppComponent.oauth.hasExpired());
        this.hideLoadingScreen();
      }
    });
  }

  /**Validate existing session, or create one
   * */
  public async validateSession(
    callback?: (
      status: boolean,
      msg: string,
      responseType: ApiResponseType
    ) => any
  ) {
    const appVersion = await this.appVersion
      .getVersionNumber()
      .then((value) => {
        return value;
      })
      .catch(() => {
        return CONFIGS.app_version;
      });
    const appName = await this.appVersion
      .getAppName()
      .then((value) => {
        return value;
      })
      .catch(() => {
        return CONFIGS.app_name;
      });

    const platform = this.platform.is("android")
      ? "Android"
      : this.platform.is("ios")
        ? "IOS"
        : this.platform.is("desktop")
          ? "Desktop"
          : "Unknown";

    const deviceType = this.platform.is("mobile")
      ? "Phone"
      : this.platform.is("tablet")
        ? "Tablet"
        : this.platform.is("desktop")
          ? "Computer"
          : "Unknown";

    const os =
      Utils.assertAvailable(this.device.platform) &&
        Utils.assertAvailable(this.device.version)
        ? this.device.platform + " " + this.device.version
        : platform;

    const deviceModel =
      Utils.assertAvailable(this.device.manufacturer) &&
        Utils.assertAvailable(this.device.model)
        ? this.device.manufacturer + " " + this.device.model
        : Utils.assertAvailable(this.device.manufacturer)
          ? this.device.manufacturer
          : null;

    Api.initialize(
      {
        os: os,
        version: appVersion,
        app_name: appName,
        device_type: deviceType,
        device_name: deviceModel,
        partner: true,
      },
      (status, result, responseType) => {
        if (status && result) {
          let session: Session = result.data;
          // Save  session info
          SessionManager.setSession(session, (done) => {
            if (done && session.user) {
              // Set app's Language with user's
              if (Utils.assertAvailable(session.user.lang)) {
                const key = session.user.lang.toUpperCase();
                if (Langs[key]) {
                  // If Language Supported
                  Strings.setLanguage(key);
                }
              }
              if (Utils.assertAvailable(callback)) {
                callback(done, result.msg, responseType);
              }
            } else {
              if (Utils.assertAvailable(callback)) {
                callback(
                  done,
                  Strings.getString("error_unexpected"),
                  responseType
                );
              }
            }
          });
        } else {
          if (Utils.assertAvailable(callback)) {
            callback(
              false,
              result ? result : Strings.getString("error_unexpected"),
              responseType
            );
          }
        }
      }
    );
  }

  /**Set Country
   * @param {string} country_code
   * @param {(status: boolean, msg: string, responseType: ApiResponseType) => any} callback
   */
  public set_country(
    country_code: string,
    callback?: (
      status: boolean,
      msg: string,
      responseType: ApiResponseType
    ) => any
  ) {
    Api.setCountry(country_code, (status, result, responseType) => {
      if (status) {
        this.validateSession(callback);
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
  public set_language(
    language_code: string,
    callback?: (
      status: boolean,
      msg: string,
      responseType: ApiResponseType
    ) => any
  ) {
    Api.setLanguage(language_code, (status, result, responseType) => {
      if (status) {
        this.validateSession(callback);
      } else {
        if (Utils.assertAvailable(callback)) {
          callback(status, result, responseType);
        }
      }
    });
  }
}
