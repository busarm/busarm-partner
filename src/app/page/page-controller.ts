import {ToastType, Utils} from "../libs/Utils";
import {Assets, Strings} from "../resources";
import {OnDestroy, OnInit} from "@angular/core";
import {AppComponent} from "../app.component";
import {SessionManager} from "../libs/SessionManager";
import {PingObject, UserInfo, ValidateSessionObject} from "../models/ApiResponse";
import { Params } from "@angular/router";
import { MD5 } from "crypto-js";

export class PageController implements OnInit, OnDestroy {

    //Define resources for views to use
    public strings = Strings;
    public assets = Assets;

    public selectedCountry: string = null;
    public session: ValidateSessionObject = null;
    public userInfo: UserInfo = null;
    public routeKey: string = null;

    public timer: number = null;
    public interval: number = null;

    /**Global Constructor*/
    protected constructor() {
        this.getSession();
        this.getUserInfo();
    }

    /* lifecycle events */
    public async ngOnInit() {
        await this.getSession();
        await this.getUserInfo();
        this.routeKey = await this.getRouteKey();
    }
    public ngOnDestroy(){
        if(this.routeKey){
            SessionManager.remove(this.routeKey); //remove params after use
            this.routeKey = null;
        }
    }
    public ionViewDidEnter(){
        this.hideLoading();
    }
    public ionViewDidLeave(){
        clearInterval(this.interval);
    }


    /**Get App instance*/
    get instance() {
        return AppComponent.instance;
    }

    /**Get oauth instance*/
    get oauth() {
        return AppComponent.oauth;
    }

    /**Get Session Info
     * @return {ValidateSessionObject}
     */
    public async getSession()  {
        return this.session = await new Promise<ValidateSessionObject>((resolve: (data: ValidateSessionObject) => any) => {
            SessionManager.getSession(data => {
                if (data) {
                    resolve(data);
                } else {
                    resolve(null);
                }
            });
        });
    }

    /**Get User Info
     * @return {UserInfo}
     */
    public async getUserInfo(){
        return this.userInfo = await new Promise<UserInfo>((resolve: (data: UserInfo) => any) => {
            SessionManager.getUserInfo(data => {
                if (data) {
                    resolve(data);
                } else {
                    resolve(null);
                }
            });
        });
    }

    /**Set Country*/
    public async setCountry() {
        if (this.selectedCountry != null && (this.selectedCountry != this.session.country.country_code) && this.userInfo.allow_multi_countries){
            this.showLoading().then(()=>{
                this.instance.set_country(this.selectedCountry,  async (status, msg) => {
                    if (status) {
                        this.instance.events.publishCountryChangeEvent(true);
                    } else {
                        this.instance.events.publishCountryChangeEvent(false);
                        await this.showToastMsg(msg?msg:Strings.getString("error_unexpected"), ToastType.ERROR);
                    }
                    this.hideLoading();
                })
            });
        }
    }

    /**
     * Navigate to a new page
     * @param path 
     * @param params 
     */
    public async navigate(path:string, params?:any){
        if(params){await this.setRouteParams(path, params)}
        return this.instance.router.navigateByUrl(path,  {
                queryParamsHandling:'merge',
                preserveFragment:false, 
                preserveQueryParams:false});
    }
    
    /**
     * Set Route Params
     * @param path 
     * @param params 
     */
    public async setRouteParams(path:string, params:any){
        return await new Promise<boolean>(async (resolve: (data: boolean) => any) => {
            SessionManager.set((await this.getRouteKey(path)), params, data => {
                if (data) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    /**
     * Get Route params
     * @param path 
     */
    public async getRouteParams(path?:string){
        return new Promise<any>(async (resolve: (data: any) => any) => {
            SessionManager.get((path ? (await this.getRouteKey(path)) : this.routeKey), data => {
                if (data) {
                    resolve(data);
                } else {
                    resolve(null);
                }
            });
        });
    }

    /**
     * Get Route params
     * @param path 
     */
    public async getRouteKey(path?:string){
        return new Promise<any>((resolve: (data: any) => any) => {
            resolve('route_'+MD5(Utils.safeString((path?path:this.instance.router.url))).toString());
        });
    }

    /**
     * Get Url Query params
     * @param path 
     */
    public async getQueryParams(){
        return await new Promise<Params>((resolve: (data: Params) => any) => {
            this.instance.router.routerState.root.queryParams.subscribe(async (queryParams)=>{
                if(queryParams){
                    resolve(queryParams)
                }
                else {
                    resolve(null);
                }
              })
        });
    }

    /**Show Network error msg*/
    public showNotConnectedMsg(onDismiss?: (data: any, role: string) => any) {
        this.instance.showNotConnectedMsg(onDismiss);
    }

    /**Show Loader*/
    public showLoading() {
        return this.instance.showLoading();
    }

    /**Hide Loader*/
    public hideLoading() {
        return this.instance.hideLoading();
    }

    /**Show Toast*/
    public showToastMsg(msg: string,
                        type: ToastType,
                        duration: number = 10000,
                        showCloseButton: boolean = true,
                        closeButton: string = Utils.convertHTMLEntity("&times;"),
                        onDismiss?: (data: any, role: string) => any,
                        position: 'bottom' | 'top' = 'bottom') {
        return this.instance.showToastMsg(msg, type, duration, showCloseButton, closeButton, onDismiss, position);
    }

    /**Hide Toast*/
    public hideToastMsg() {
        return this.instance.hideToastMsg();
    }

    /**Show Alert*/
    public showAlert(title?: string,
                     message?: string,
                     primaryBt?: {
                         title: string,
                         callback?: (data?: any) => any
                     },
                     secondaryBt?: {
                         title: string,
                         callback?: (data?: any) => any
                     }) {
        return this.instance.showAlert(title, message, primaryBt, secondaryBt);
    }

    /**Hide Alert*/
    public hideAlert() {
        return this.instance.hideAlert();
    }


    /**Check if Assert available in variable*/
    public assertAvailable(data: any) {
        return Utils.assertAvailable(data)
    }

    /**
     * Set Timout
     * @param handler 
     * @param timeout 
     * @param stopPrevious 
     */
    public setTimeout(handler?: TimerHandler, timeout?: number, stopPrevious: boolean = true) {
        if (stopPrevious && this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(handler, timeout)
    }

    /**
     * Set Interval
     * @param handler 
     * @param timeout 
     * @param stopPrevious 
     */
    public setInterval(handler?: TimerHandler, timeout?: number, stopPrevious: boolean = true) {
        if (stopPrevious && this.interval) {
            clearInterval(this.interval);
        }
        this.interval = setInterval(handler, timeout)
    }

    /*backButtonEvent() {
        this.platform.backButton.subscribe(async () => {
            // close action sheet
            try {
                const element = await this.actionSheetCtrl.getTop();
                if (element) {
                    element.dismiss();
                    return;
                }
            } catch (error) {
            }

            // close popover
            try {
                const element = await this.popoverCtrl.getTop();
                if (element) {
                    element.dismiss();
                    return;
                }
            } catch (error) {
            }

            // close modal
            try {
                const element = await this.modalCtrl.getTop();
                if (element) {
                    element.dismiss();
                    return;
                }
            } catch (error) {
                console.log(error);

            }

            // close side menue
            try {
                const element = await this.menu.getOpen();
                if (element !== null) {
                    this.menu.close();
                    return;
                }

            } catch (error) {
            }

            this.routerOutlets.forEach((outlet: IonRouterOutlet) => {
                if (outlet && outlet.canGoBack()) {
                    outlet.pop();
                } else if (this.router.url === '/home') {
                    if (new Date().getTime() - this.lastTimeBackPress < this.timePeriodToExit) {
                        // this.platform.exitApp(); // Exit from app
                        navigator['app'].exitApp(); // work for ionic 4

                    } else {
                        this.toast.show(
                            `Press back again to exit App.`,
                            '2000',
                            'center')
                            .subscribe(toast => {
                                // console.log(JSON.stringify(toast));
                            });
                        this.lastTimeBackPress = new Date().getTime();
                    }
                }
            });
        });
    }*/
}