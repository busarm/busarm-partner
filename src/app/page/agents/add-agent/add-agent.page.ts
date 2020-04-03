import {Component, Input} from '@angular/core';
import {PageController} from "../../page-controller";
import {ModalController} from "@ionic/angular";
import {UserInfo} from "../../../models/ApiResponse";
import {ToastType} from "../../../libs/Utils";
import {Api} from "../../../libs/Api";

@Component({
    selector: 'app-agent-agent',
    templateUrl: './add-agent.page.html',
    styleUrls: ['./add-agent.page.scss'],
})
export class AddAgentPage extends PageController {

    name: string;
    email: string;
    phone: string;
    dialCode:string;
    isAdmin: boolean;
    isExistingUser: boolean;
    
    updated:boolean = false;

    constructor(private modalCtrl: ModalController) {
        super();
    }

    public async ngOnInit() {
        await super.ngOnInit();
        this.dialCode = this.userInfo.dial_code;
    }

    public async ionViewDidEnter(){}

    /**Add Bus*/
    public add(){
        let user: UserInfo;
        if (this.isExistingUser){
            user = {
                email:this.email,
                is_admin:this.isAdmin?1:0,
            };
        }
        else {
            user = {
                name:this.name,
                email:this.email,
                dial_code:this.dialCode,
                phone:this.phone,
                is_admin:this.isAdmin?1:0,
            };
        }


        //Show Loader
        this.showLoading().then(()=>{
            Api.addNewAgent(user, (status, result) => {
                this.hideLoading();
                if (status){
                    if (result.status){
                        this.updated = true;
                        this.dismiss();
                        this.showToastMsg(result.msg, ToastType.SUCCESS);
                    }
                    else{
                        this.showToastMsg(result.msg, ToastType.ERROR);
                    }
                }
                else{
                    this.showToastMsg(result, ToastType.ERROR);
                }
            });
        });
    }


    /**Close Modal*/
    async dismiss(){
        const modal = await this.modalCtrl.getTop();
        if(modal)
            modal.dismiss(this.updated);
    }
}
