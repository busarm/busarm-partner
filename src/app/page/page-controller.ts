import {ToastType, Utils} from "../utils/Utils";
import {Assets, Strings} from "../resources";
import {OnDestroy, OnInit} from "@angular/core";
import {AppComponent} from "../app.component";
import {SessionManager} from "../utils/SessionManager";
import {UserInfo, ValidateSessionObject} from "../models/ApiResponse";

export abstract class PageController implements OnInit, OnDestroy {

    //Define resources for views to use
    public strings = Strings;
    public assets = Assets;

    public session: ValidateSessionObject = null;
    public userInfo: UserInfo = null;
    public static timer: number = null;


    /**Global Constructor*/
    protected constructor() {
        this.getSession();
        this.getUserInfo();
    }

    /* lifecycle events */
    public async ngOnInit() {
        await this.getSession();
        await this.getUserInfo();
    }
    public ngOnDestroy(){}
    public ionViewDidEnter(){}
    public ionViewDidLeave(){}



    /**Get App instance*/
    get instance() {
        return AppComponent.instance;
    }

    /**Get oauth instance*/
    get oauth() {
        return AppComponent.oauth;
    }


    /**Get Session Info*/
    public async getSession() {
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

    /**Get User Info*/
    public async getUserInfo() {
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
                        duration: number = 3000,
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

    public setTimeout(handler?: TimerHandler, timeout?: number, stopPrevious: boolean = true) {
        if (stopPrevious && PageController.timer) {
            clearTimeout(PageController.timer);
        }
        PageController.timer = setTimeout(handler, timeout)
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