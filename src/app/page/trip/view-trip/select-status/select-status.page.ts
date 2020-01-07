import {Component, Input} from '@angular/core';
import {PageController} from "../../../page-controller";
import {ModalController, NavController} from "@ionic/angular";
import {BusInfo, BusType, TripStatus} from "../../../../models/ApiResponse";
import {ToastType, Utils} from "../../../../utils/Utils";
import {Api} from "../../../../utils/Api";

@Component({
    selector: 'app-select-status',
    templateUrl: './select-status.page.html',
    styleUrls: ['./select-status.scss'],
})
export class SelectStatusPage extends PageController {

    @Input() statusList: TripStatus[] = null;

    status: TripStatus;

    constructor(private modalCtrl: ModalController,
                public navCtrl: NavController) {
        super();
    }

    public async ngOnInit() {}
    public async ionViewDidEnter(){}

    /**Add status*/
    public add(status?:TripStatus){
        if (this.assertAvailable(status)) { //If bus selected
            this.status = status;
            this.dismiss();
        }
    }


    /**Close Modal*/
    async dismiss(){
        const modal = await this.modalCtrl.getTop();
        if(modal)
            modal.dismiss(this.status);
    }
}
