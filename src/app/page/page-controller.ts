import {Component, OnDestroy, OnInit} from "@angular/core";
import { Params } from "@angular/router";
import { MD5 } from "crypto-js";
import {AppComponent} from "../app.component";
import {ToastType, Utils} from "../helpers/Utils";
import {Assets, Strings} from "../resources";
import {SessionManager} from "../helpers/SessionManager";
import {UserInfo, Session} from "../models/ApiResponse";
import { CONFIGS } from "../../environments/environment";

@Component({
    template: ''
})
export class PageController implements OnInit, OnDestroy {

    //Define resources for views to use
    public strings = Strings;
    public assets = Assets;

    public selectedCountry: string = null;
    public session: Session = null;
    public userInfo: UserInfo = null;
    public routeKey: string = null;

    public timer: any = null;
    public interval: any = null;

    /**Global Constructor*/
    protected constructor() {
        this.loadSession();
        this.loadUser();
    }

    /* lifecycle events */
    public async ngOnInit() {
        await this.loadSession();
        await this.loadUser();
        this.routeKey = await this.getRouteKey();
    }
    public ngOnDestroy(){
        if (this.interval) {
            clearInterval(this.interval);
        }
        if(this.routeKey){
            SessionManager.remove(this.routeKey); //remove params after use
            this.routeKey = null;
        }
    }
    public ionViewWillEnter (){
        this.hideLoading();
    }
    public ionViewDidEnter(){
        this.hideLoading();
    }
    public ionViewWillLeave(){
        if (this.interval) {
            clearInterval(this.interval);
        }
        if(this.routeKey){
            SessionManager.remove(this.routeKey); //remove params after use
            this.routeKey = null;
        }
    }
    public ionViewDidLeave(){
        if (this.interval) {
            clearInterval(this.interval);
        }
    }


    /**Get App instance*/
    get instance() {
        return AppComponent.instance;
    }

    /**Get oauth instance*/
    get oauth() {
        return AppComponent.oauth;
    }

    /**Get app version*/
    get version(){
        return CONFIGS.app_version;
    }

    /**Get Session Info
     * @return {Session}
     */
    public async loadSession()  {
        return this.session = await SessionManager.getSession();
    }

    /**Get User Info
     * @return {UserInfo}
     */
    public async loadUser() {
        return this.userInfo = await SessionManager.getUserInfo();
    }

    /**Set Country*/
    public async setCountry() {
        if (this.selectedCountry != null && (this.selectedCountry != this.session.country.country_code) && this.userInfo.allow_multi_countries){
            this.showLoading().then(()=>{
                this.instance.set_country(this.selectedCountry,  async (status, msg) => {
                    if (status) {
                        this.instance.events.countryChange.emit(true);
                    } else {
                        this.instance.events.countryChange.emit(false);
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
        return this.instance.router.navigateByUrl(path);
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
            resolve(MD5('route_'+Utils.safeString((path?path:this.instance.router.url).replace('/',''))).toString());
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
    public showLoading(backdropDismiss = false) {
        return this.instance.showLoading({ backdropDismiss });
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
     * @param ms 
     * @param stopPrevious 
     */
    public async setTimeout(ms?: number, stopPrevious: boolean = true) {
        return new Promise((resolve) => {
            if (stopPrevious && this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = setTimeout(resolve, ms)
        });
    }

    /**
     * Set Interval
     * @param handler 
     * @param ms 
     * @param timeout 
     * @param stopPrevious 
     */
    public async setInterval(handler?: TimerHandler, ms?: number, stopPrevious: boolean = true) {
        if (stopPrevious && this.interval) {
            clearInterval(this.interval);
        }
        this.interval = setInterval(handler, ms)
    }
}