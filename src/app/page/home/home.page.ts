import {Component} from '@angular/core';
import {PageController} from "../page-controller";
import {MenuController, ModalController, Platform} from "@ionic/angular";
import {Router, RouterEvent} from "@angular/router";
import { Api } from '../../helpers/Api';
import { SessionManager } from '../../helpers/SessionManager';

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
})
export class HomePage extends PageController {
    public selectedPage:string = "";
    platform: Platform;

    constructor(private router: Router,
                private modalCtrl: ModalController,
                private menu: MenuController,
                platform: Platform) {
        super();
        this.platform = platform;
    }

    /**Set Selected Url*/
    private setSelectedUrl(url:string){
        if (this.assertAvailable(url) && url.startsWith("/home/") ) {
            this.selectedPage = url;
        }
    }

    public async ngOnInit() {
        await super.ngOnInit();
        this.setSelectedUrl(this.router.url);
        this.router.events.subscribe((event: RouterEvent) => {
            if (event && event.url && this.router.url == event.url) {
                this.setSelectedUrl(event.url)
            }
        });
        this.menu.enable(true,"home")
    }
    public async ionViewDidEnter(){}

    public willChange(event){
        this.selectedPage = event.tab;
    }

    /**Show Logout confirmation
     * */
     public confirmLogout() {
        this.showAlert(
            this.strings.getString("logout_txt"),
            this.strings.getString("logout_msg_txt"),
            {
                title: this.strings.getString("no_txt")
            },
            {
                title: this.strings.getString("yes_txt"),
                callback: () => {
                    this.logout();
                }
            },
        );
    }

    /**Logout user*/
    public logout() {
        this.showLoading().then(() => {
            Api.logout(() => {
                SessionManager.logout();
                this.hideLoading();
            });
        });
    }
}
