import {Component, Input} from '@angular/core';
import {PageController} from "../../page-controller";
import {ModalController} from "@ionic/angular";
import {BusInfo} from "../../../models/ApiResponse";
import {ToastType} from "../../../libs/Utils";
import {Api} from "../../../libs/Api";

@Component({
    selector: 'app-share-bus',
    templateUrl: './share-bus.page.html',
    styleUrls: ['./share-bus.page.scss'],
})
export class ShareBusPage extends PageController {

    @Input() busId: BusInfo;

    accountId: string;
    title: string;

    constructor(private modalCtrl: ModalController) {
        super();
    }

    public async ngOnInit() {
        await super.ngOnInit();
    }
    public async ionViewDidEnter(){
        if (!this.assertAvailable(this.busId)) {
            this.showToastMsg(this.strings.getString("error_unexpected"), ToastType.ERROR);
            this.modalCtrl.dismiss();
        }
    }

    /**Add Share Bus*/
    public add(){
        
        //Show Loader
        this.showLoading().then(()=>{
            Api.addSharedBus(this.busId, this.accountId, this.title, (status, result) => {
                this.hideLoading();
                if (status){
                    if (result.status){
                        this.dismiss(true);
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
    async dismiss(shared?:boolean){
        const modal = await this.modalCtrl.getTop();
        if(modal)
            modal.dismiss(shared);
    }
}
