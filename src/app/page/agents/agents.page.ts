import {Component} from '@angular/core';
import {ModalController} from "@ionic/angular";
import {InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import {PageController} from "../page-controller";
import {UserInfo} from "../../models/ApiResponse";
import {ToastType} from "../../helpers/Utils";
import {Api} from "../../helpers/Api";
import {Strings} from "../../resources";
import {AddAgentPage} from "./add-agent/add-agent.page";

@Component({
    selector: 'app-view-agents',
    templateUrl: './agents.page.html',
    styleUrls: ['./agents.page.scss'],
})
export class AgentsPage extends PageController {

    searchText: string = null;
    agents: UserInfo[] = null;
    currentAgents: UserInfo[] = null;

    constructor(public modalCtrl: ModalController,
                private iab: InAppBrowser) {
        super();
    }

    public async ngOnInit() {
        await super.ngOnInit();
    }

    public async ionViewDidEnter(){
        if (this.userInfo && (this.userInfo.is_admin || this.userInfo.is_partner)){
            this.loadAgentsView();
        }
    }

    
    /**Search input event
     * */
    public onInput(event,isSearch?) {
        if (event.isTrusted) {
            this.searchText = event.target.value;
            if (this.assertAvailable(this.searchText) && this.searchText.length > 1) {
                if (this.assertAvailable(this.agents)) {
                    this.currentAgents = [];
                    for (let index in this.agents) {
                        let agent:UserInfo = this.agents[index];
                        let reg = new RegExp(this.searchText, 'gi');
                        if (agent.name.match(reg) || agent.email.match(reg)) {
                            this.currentAgents.push(agent)
                        }
                    }
                }
            }
            else {
                this.onClear(event);
            }
        }
    }

    /**Reset Search bar*/
    public onClear(event) {
        if (event.isTrusted) {
            this.searchText = null;
            this.currentAgents = this.agents;
        }
    }

    /**Refresh View*/
    public refreshAgentsView(event?) {
        this.loadAgentsView(() => {
            if (event) {
                event.target.complete();
            }
        })
    }

    /**Load Agents View*/
    public loadAgentsView(completed?: () => any) {
        /*Get Agents*/
        Api.getAgents((status, result) => {
            if (status) {
                if (this.assertAvailable(result)) {
                    this.agents = this.currentAgents = result.data;
                } else {
                    this.showToastMsg(Strings.getString("error_unexpected"), ToastType.ERROR);
                }
            } else {
                this.showToastMsg(result, ToastType.ERROR);
            }

            if (this.assertAvailable(completed)) {
                completed();
            }
        }, false);
    }

    /**Launch add user page*/
    async showAddAgent() {
        let chooseModal = await this.modalCtrl.create({
            component: AddAgentPage
        });
        chooseModal.onDidDismiss().then(data => {
            if (data.data) {
                this.loadAgentsView();
            }
        });
        return await chooseModal.present();
    }

    /**Show Delete confirmation
     * */
    public confirmDeleteAgent(user:UserInfo) {
        this.showAlert(
            this.strings.getString("delete_agent_title_txt"),
            this.strings.getString("delete_agent_msg_txt"),
            {
                title: this.strings.getString("no_txt")
            },
            {
                title: this.strings.getString("yes_txt"),
                callback: () => {
                    this.deleteAgent(user);
                }
            },
        );
    }

    /**Delete Agent*/
    public deleteAgent(user: UserInfo) {
        this.showLoading().then(()=>{
            Api.deleteAgent(user.agent_id,(status, result) => {
                this.hideLoading();
                if (status) {
                    if (this.assertAvailable(result)) {
                        if (result.status){
                            this.loadAgentsView();
                            this.showToastMsg(result.msg, ToastType.SUCCESS);
                        } else{
                            this.showToastMsg(result.msg, ToastType.ERROR);
                        }
                    } else {
                        this.showToastMsg(Strings.getString("error_unexpected"), ToastType.ERROR);
                    }
                } else {
                    this.showToastMsg(result, ToastType.ERROR);
                }
            });
        });
    }

    /**Toggle Agent active status*/
    public toggleAgent(user: UserInfo , toggle: boolean) {
        if(user.is_active !== toggle) {
            this.showLoading().then(()=>{
                Api.toggleAgent(user.agent_id, toggle,(status, result) => {
                    this.hideLoading();
                    if (status) {
                        if (this.assertAvailable(result)) {
                            if (result.status){
                                this.showToastMsg(result.msg, ToastType.SUCCESS);
                            }
                            else{
                                this.showToastMsg(result.msg, ToastType.ERROR);
                            }
                        }
                        else {
                            this.showToastMsg(Strings.getString("error_unexpected"), ToastType.ERROR);
                        }
                    }
                    else {
                        this.showToastMsg(result, ToastType.ERROR);
                    }
                    this.loadAgentsView();
                });
            });
        }
    }

    /**Show confirmation
     * */
    public confirmMakeAdmin(user: UserInfo) {
        this.showAlert(
            this.strings.getString("make_admin_title_txt"),
            this.strings.getString("make_admin_msg_txt"),
            {
                title: this.strings.getString("no_txt")
            },
            {
                title: this.strings.getString("yes_txt"),
                callback: () => {
                    this.updateAdmin(user.agent_id,0);
                }
            },
        );
    }

    /**Show confirmation
     * */
    public confirmRemoveAdmin(user:UserInfo) {
        this.showAlert(
            this.strings.getString("remove_admin_title_txt"),
            this.strings.getString("remove_admin_msg_txt"),
            {
                title: this.strings.getString("no_txt")
            },
            {
                title: this.strings.getString("yes_txt"),
                callback: () => {
                    this.updateAdmin(user.agent_id,1);
                }
            },
        );
    }

    /**Update Administrator status for user*/
    public updateAdmin(agentId: string,remove:number) {
        this.showLoading().then(()=>{
            Api.updateAdminStatus(agentId,remove,(status, result) => {
                this.hideLoading();
                if (status) {
                    if (this.assertAvailable(result)) {
                        if (result.status){
                            this.loadAgentsView();
                            this.showToastMsg(result.msg, ToastType.SUCCESS);
                        }
                        else{
                            this.showToastMsg(result.msg, ToastType.ERROR);
                        }
                    }
                    else {
                        this.showToastMsg(Strings.getString("error_unexpected"), ToastType.ERROR);
                    }
                }
                else {
                    this.showToastMsg(result, ToastType.ERROR);
                }
            });
        });
    }

    /**Show confirmation
     * */
    public confirmForgotPassword(user:UserInfo) {
        this.showAlert(
            this.strings.getString("forgot_password_title_txt"),
            this.strings.getString("forgot_password_msg_txt"),
            {
                title: this.strings.getString("no_txt")
            },
            {
                title: this.strings.getString("yes_txt"),
                callback: () => {
                    this.sendAuthorization(user.email);
                }
            },
        );
    }

    /**Send authorization for user*/
    public sendAuthorization(email: string,) {
        this.showLoading().then(()=>{
            Api.processEmailAuthorization(email, (status, result) => {
                this.hideLoading();
                if (status) {
                    if (this.assertAvailable(result)) {
                        if (result.status){
                            if (this.assertAvailable(result.data)){
                                this.iab.create(result.data,'_blank',{
                                    zoom:"no",
                                    hardwareback:"yes"
                                });
                            }
                            this.showToastMsg(result.msg, ToastType.SUCCESS);
                        }
                        else{
                            this.showToastMsg(result.msg, ToastType.ERROR);
                        }
                    }
                    else {
                        this.showToastMsg(Strings.getString("error_unexpected"), ToastType.ERROR);
                    }
                }
                else {
                    this.showToastMsg(result, ToastType.ERROR);
                }
            });
        });
    }
}
