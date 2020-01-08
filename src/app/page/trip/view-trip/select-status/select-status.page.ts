import {Component, Input} from '@angular/core';
import {PageController} from "../../../page-controller";
import {ModalController} from "@ionic/angular";
import {TripStatus} from "../../../../models/ApiResponse";

@Component({
    selector: 'app-select-status',
    templateUrl: './select-status.page.html',
    styleUrls: ['./select-status.scss'],
})
export class SelectStatusPage extends PageController {

    @Input() statusList: TripStatus[] = null;

    status: TripStatus;

    constructor(private modalCtrl: ModalController) {
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
