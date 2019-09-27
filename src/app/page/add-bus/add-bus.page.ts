import {Component, Input} from '@angular/core';
import {PageController} from "../page-controller";
import {ModalController, NavController} from "@ionic/angular";
import {BusInfo, BusType} from "../../models/ApiResponse";
import {ToastType, Utils} from "../../utils/Utils";
import {Api} from "../../utils/Api";

@Component({
    selector: 'app-add-bus',
    templateUrl: './add-bus.page.html',
    styleUrls: ['./add-bus.page.scss'],
})
export class AddBusPage extends PageController {

    @Input() busTypes: BusType[];
    @Input() buses: BusInfo[] = null;

    bus: BusInfo;
    selectedBusType: number;
    busPlateNumber: string;
    busDesc: string;

    updated:boolean = false;

    constructor(private modalCtrl: ModalController,
                public navCtrl: NavController) {
        super();
    }

    public async ngOnInit() {}
    public async ionViewDidEnter(){}

    /**Add Bus*/
    public add(bus?:BusInfo){

        if (this.assertAvailable(bus)) { //If bus selected
            this.bus = bus;
            this.dismiss();
        }
        else { //Get new bus entries

            if (Utils.assertAvailable(this.selectedBusType)) {

                if (Utils.assertAvailable(this.busPlateNumber)) {

                    for (let i = 0; i<this.busTypes.length; i++){
                        let type:BusType = this.busTypes[i];
                        if (type.id == String(this.selectedBusType)){
                            this.bus = {
                                plate_num:this.busPlateNumber,
                                description:this.busDesc,
                                type:type.id
                            };
                            break;
                        }
                    }

                    //Show Loader
                    this.showLoading().then(()=>{
                        Api.addBus(this.bus, (status, result) => {
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
    dismiss(){
        this.modalCtrl.dismiss(this.updated?this.updated:this.bus)
    }
}
