import { Component, OnDestroy, OnInit } from "@angular/core";
import { AppComponent } from "../app.component";
import { Utils } from "../helpers/Utils";
import { ToastType } from "../services/app/AlertService";
import { Assets, Strings } from "../resources";
import { User } from "../models/User/User";
import { Session } from "../models/Session";
import { CONFIGS } from "../../environments/environment";
import { Events } from "../services/app/Events";
import { Subscription } from "rxjs";
import { Api } from "../helpers/Api";
import { AnimationService } from "../services/app/AnimationService";

@Component({
  template: "",
})
export class PageController implements OnInit, OnDestroy {
  //Define resources for views to use
  public strings = Strings;
  public assets = Assets;

  protected animation: AnimationService;
  protected events: Events;
  protected subscriptions: Subscription = new Subscription();

  public selectedCountry: string = null;
  public selectedLanguage: string = null;

  public session: Session = null;
  public user: User = null;

  public timer: any = null;
  public interval: any = null;

  /**Global Constructor*/
  protected constructor() {
    this.loadSession();
    this.loadUser();
    // Load common event handler
    this.events = this.instance.events;
    this.animation = this.instance.animationService;
  }

  /* lifecycle events */
  public async ngOnInit() {
    await this.loadSession();
    await this.loadUser();
    // Check connection
    this.instance.networkProvider.checkConnection();
  }

  public ngOnDestroy() {
    // Remove route params
    this.clearRouteParams();
    // Clear intervals
    if (this.interval) {
      this.clearInterval();
    }
    // Subscriptions
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  public ionViewWillEnter() {
    this.hideLoading();
  }
  public ionViewDidEnter() {
    this.hideLoading();
  }
  public ionViewWillLeave() {
    // Remove route params
    this.clearRouteParams();
    // Clear intervals
    if (this.interval) {
      this.clearInterval();
    }
  }
  public ionViewDidLeave() {
    if (this.interval) {
      this.clearInterval();
    }
  }

  /**Get App instance*/
  get instance() {
    return AppComponent.instance;
  }

  /**Get oauth instance*/
  get oauth() {
    return this.instance.authService.getOauth();
  }

  /**Get app version*/
  get version() {
    return CONFIGS.app_version;
  }

  /**Get Session Info
   * @return {Promise<Session>}
   */
  public async loadSession(): Promise<Session> {
    return (this.session = await this.instance.sessionService.getSession());
  }

  /**Get User Info
   * @return {Promise<User>}
   */
  public async loadUser(): Promise<User> {
    return (this.user = await this.instance.sessionService.getUserInfo());
  }

  /**
   * Navigate to a new page
   * @param path
   * @param params
   */
  public async navigate(path: string, params?: any) {
    return await this.instance.routeService.navigate(path, params);
  }

  /**
   * Set Route Params
   * @param path
   * @param params
   */
  public async setRouteParams(path: string, params: any) {
    return await this.instance.routeService.setRouteParams(path, params);
  }

  /**
   * Clear Route Params
   * @param path
   */
  public async clearRouteParams(path?: string) {
    return await this.instance.routeService.clearRouteParams(path);
  }

  /**
   * Get Route params
   * @param path
   */
  public async getRouteParams(path?: string) {
    return await this.instance.routeService.getRouteParams(path);
  }

  /**
   * Get Url Query params
   * @param path
   */
  public async getQueryParams() {
    return await this.instance.routeService.getQueryParams();
  }

  /**Show Network error msg*/
  public showNotConnectedMsg(onDismiss?: (data: any, role: string) => any) {
    this.instance.alertService.showNotConnectedMsg(onDismiss);
  }

  /**Show Loader*/
  public showLoading(backdropDismiss = false, showBackdrop = true) {
    return this.instance.alertService.showLoading({
      backdropDismiss,
      showBackdrop,
    });
  }

  /**Hide Loader*/
  public hideLoading() {
    return this.instance.alertService.hideLoading();
  }

  /**Show Toast*/
  public showToastMsg(
    msg: string,
    type: ToastType,
    duration: number = 10000,
    showCloseButton: boolean = true,
    closeButton: string = Utils.convertHTMLEntity("&times;"),
    onDismiss?: (data: any, role: string) => any,
    position: "bottom" | "top" = "bottom"
  ) {
    return this.instance.alertService.showToastMsg(
      msg,
      type,
      duration,
      showCloseButton,
      closeButton,
      onDismiss,
      position
    );
  }

  /**Hide Toast*/
  public hideToastMsg() {
    return this.instance.alertService.hideToastMsg();
  }

  /**Show Alert*/
  public showAlert(
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
    return this.instance.alertService.showAlert(
      title,
      message,
      primaryBt,
      secondaryBt
    );
  }

  /**Hide Alert*/
  public hideAlert() {
    return this.instance.alertService.hideAlert();
  }

  /**Check if Assert available in variable*/
  public assertAvailable(data: any) {
    return Utils.assertAvailable(data);
  }

  /**
   * Set Timout
   * @param ms
   * @param stopPrevious
   */
  public async setTimeout(ms?: number, stopPrevious: boolean = true) {
    return new Promise((resolve) => {
      if (stopPrevious && this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(resolve, ms);
    });
  }

  /**
   * Set Interval
   * @param handler
   * @param ms
   * @param stopPrevious
   */
  public setInterval(
    handler?: TimerHandler,
    ms?: number,
    stopPrevious: boolean = true
  ) {
    if (stopPrevious && this.interval) {
      this.clearInterval();
    }
    this.interval = setInterval(handler, ms);
  }

  /**
   * Clear Interval
   */
  public clearInterval() {
    clearInterval(this.interval);
  }

  /**Set Country*/
  public async setCountry() {
    if (
      this.selectedCountry != null &&
      this.selectedCountry != this.session.country.country_code &&
      this.user.allow_multi_countries
    ) {
      this.showLoading().then(() => {
        Api.setCountry(this.selectedCountry, async ({ status }) => {
          if (status) {
            let session = await this.instance.authService.validateSession();
            if (session) {
              if (session.status) {
                this.instance.events.countryChanged.next(true);
              } else {
                this.instance.events.countryChanged.next(false);
                await this.showToastMsg(
                  session.msg
                    ? session.msg
                    : Strings.getString("error_unexpected"),
                  ToastType.ERROR
                );
              }
            }
          } else {
            this.hideLoading();
          }
        });
      });
    }
  }

  /** Current platform is cordova */
  public is_cordova() {
    return this.instance.platform.is("cordova");
  }
  /** Current platform is ios */
  public is_ios() {
    return (
      this.instance.platform.is("ios") ||
      this.instance.platform.is("ipad") ||
      this.instance.platform.is("iphone")
    );
  }
  /** Current platform is android */
  public is_android() {
    return (
      this.instance.platform.is("android") ||
      this.instance.platform.is("phablet")
    );
  }
  /** Current platform is mobile */
  public is_mobile() {
    return this.instance.platform.is("mobile");
  }
  /** Current platform is tablet */
  public is_tablet() {
    return this.instance.platform.is("tablet");
  }

  /**
   * Variable validataes to true
   * @param {any} data
   * @returns
   */
  public is_true(data: any) {
    return data!==null && (data == true || data == 1 || data == '1');
  }
}
