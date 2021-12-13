import {Component, Input} from '@angular/core';
import {PageController} from "../../page-controller";
import {ModalController} from "@ionic/angular";
import {BusInfo, BusType} from "../../../models/ApiResponse";
import {ToastType, Utils} from "../../../helpers/Utils";
import {Api} from "../../../helpers/Api";

@Component({
    selector: 'app-add-bus',
    templateUrl: './add-bus.page.html',
    styleUrls: ['./add-bus.page.scss'],
})
export class AddBusPage extends PageController {

    @Input() busTypes: BusType[];
    @Input() buses: BusInfo[] = null;
    @Input() selectedBusType: number;

    busType: BusType;
    busPlateNumber: string;
    busSeats: number;
    busDesc: string;

    constructor(private modalCtrl: ModalController) {
        super();
    }

    public async ngOnInit() {
        await super.ngOnInit();
    }

    public async ionViewDidEnter(){
    }

    /**Set bus seats for selected type*/
    public setBusType(){
        if(this.selectedBusType){
            this.busType = this.busTypes.find(type => Utils.safeInt(type.id) == this.selectedBusType);
            if(this.busType){
                this.busSeats =  Utils.safeInt(this.busType.seats);
            }
        }
    }

    /**Add Bus*/
    public add(bus?:BusInfo){

        if (this.assertAvailable(bus)) { //If bus selected
            this.dismiss(bus);
        }
        else { //Get new bus entries

            if (Utils.assertAvailable(this.selectedBusType)) {

                if (Utils.assertAvailable(this.busPlateNumber)) {

                    let bus:BusInfo|any = {};
                    if (this.busType){
                        if (this.busSeats < Utils.safeInt(this.busType.seats)){
                            this.showToastMsg(this.strings.format(this.strings.getString('bus_seat_size_error'), this.busType.seats), ToastType.ERROR);
                            return false;
                        }
                        bus = {
                            plate_num:this.busPlateNumber,
                            description:this.busDesc,
                            seats:this.busSeats,
                            type:this.busType.id,
                            return:1,
                        };
                    }

                    //Show Loader
                    this.showLoading().then(()=>{
                        Api.addBus(bus, (status, result) => {
                            this.hideLoading();
                            if (status){
                                if (result.status){
                                    this.showToastMsg(result.msg, ToastType.SUCCESS);
                                    this.dismiss(result.data);
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

    /**Get Status class for bus status*/
    public getBusStatusClass(available: boolean): string {
        if (available) {
            return "status-ok";
        }
        else {
            return "status-error";
        }
    }

    /**Get Status text for bus status*/
    public getBusStatus(available: boolean): string {
        if (available) {
            return this.strings.getString('available_txt');
        }
        else {
            return this.strings.getString('in_use_txt');
        }
    }

    /**Close Modal*/
    async dismiss(bus?:BusInfo){
        const modal = await this.modalCtrl.getTop();
        if(modal)
            modal.dismiss(Utils.assertAvailable(bus)?bus:false);
    }
}
