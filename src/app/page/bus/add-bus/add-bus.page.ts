import {Component, Input} from '@angular/core';
import {PageController} from "../../page-controller";
import {ModalController} from "@ionic/angular";
import {BusInfo, BusType} from "../../../models/ApiResponse";
import {ToastType, Utils} from "../../../libs/Utils";
import {Api} from "../../../libs/Api";

@Component({
    selector: 'app-add-bus',
    templateUrl: './add-bus.page.html',
    styleUrls: ['./add-bus.page.scss'],
})
export class AddBusPage extends PageController {

    @Input() busTypes: BusType[];
    @Input() buses: BusInfo[] = null;

    @Input() selectedBusType: number;
    busPlateNumber: string;
    busDesc: string;

    constructor(private modalCtrl: ModalController) {
        super();
    }

    public async ngOnInit() {
        await super.ngOnInit();
    }
    public async ionViewDidEnter(){}

    /**Add Bus*/
    public add(bus?:BusInfo){

        if (this.assertAvailable(bus)) { //If bus selected
            this.dismiss(bus);
        }
        else { //Get new bus entries

            if (Utils.assertAvailable(this.selectedBusType)) {

                if (Utils.assertAvailable(this.busPlateNumber)) {

                    let bus:BusInfo|any = {};
                    for (let i = 0; i<this.busTypes.length; i++){
                        let type:BusType = this.busTypes[i];
                        if (type.id == String(this.selectedBusType)){
                            bus = {
                                plate_num:this.busPlateNumber,
                                description:this.busDesc,
                                type:type.id,
                                return:1,
                            };
                            break;
                        }
                    }

                    //Show Loader
                    this.showLoading().then(()=>{
                        Api.addBus(bus, (status, result) => {
                            this.hideLoading();
                            if (status){
                                if (result.status){
                                    this.dismiss(result.data);
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
                else{
                    this.showToastMsg(this.strings.getString('enter_bus_plate_no_txt'), ToastType.ERROR);
                }
            }
            else{
                this.showToastMsg(this.strings.getString('select_bus_type_txt'), ToastType.ERROR);
            }
        }
    }


    /**Close Modal*/
    async dismiss(bus?:BusInfo){
        const modal = await this.modalCtrl.getTop();
        if(modal)
            modal.dismiss(Utils.assertAvailable(bus)?bus:false);
    }
}
