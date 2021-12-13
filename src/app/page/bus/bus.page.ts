import {Component} from '@angular/core';
import {AlertController, ModalController} from "@ionic/angular";
import {Network} from "@ionic-native/network/ngx";
import {Api} from "../../helpers/Api";
import {Strings} from "../../resources";
import {ToastType} from "../../helpers/Utils";
import {BusType, BusInfo, TripInfo} from "../../models/ApiResponse";
import {PageController} from "../page-controller";
import {ViewBusPage} from "./view-bus/view-bus.page";
import {AddBusPage} from "./add-bus/add-bus.page";
import { Events } from '../../services/Events';

@Component({
    selector: 'app-bus',
    templateUrl: './bus.page.html',
    styleUrls: ['./bus.page.scss'],
})
export class BusPage extends PageController{

    searchText: string = null;
    buses: BusInfo[] = null;
    currentBuses: BusInfo[] = null;
    busTypes: BusType[] = null;

    constructor(public alertCtrl: AlertController,
                public modalCtrl: ModalController,
                public events: Events,
                public network: Network) {
        super();
    }

    public async ngOnInit() {
        await super.ngOnInit();

        /*Network event*/
        this.events.networkChange.subscribe(async (online) => {
            await super.ngOnInit();
            if (online) {
                await this.hideToastMsg();
                if (!this.buses) {
                    this.loadBusesView();
                }
            }
        });

        /*Country Changed event*/
        this.events.countryChange.subscribe(async (changed) => {
            await super.ngOnInit();
            if (changed) {
                this.loadBusesView();
            }
            else {
                /*Set default country*/
                this.selectedCountry = this.session.country.country_code;
            }
        }); 

        /*Buses updated event*/
        this.events.busesUpdated.subscribe(async (updated) => {
            await super.ngOnInit();
            if (updated) {
                this.loadBusesView();
            }
        }); 
    }

    public ngOnDestroy(){
        this.buses = null;
        super.ngOnDestroy();
    }

    public async ionViewDidEnter(){
        if (!this.buses) {
            this.loadBusesView();
        }
    }

    /**Search input event
     * */
    public onInput(event, isSearch?) {
        if (event.isTrusted) {
            this.searchText = event.target.value;
            if (this.assertAvailable(this.searchText) && this.searchText.length > 1) {
                if (this.assertAvailable(this.buses)) {
                    this.currentBuses = [];
                    for (let index in this.buses) {
                        let bus:BusInfo = this.buses[index];
                        let reg = new RegExp(this.searchText, 'gi');
                        if (bus.plate_num.match(reg) || 
                            bus.type.match(reg) || 
                            bus.description.match(reg)) {
                            this.currentBuses.push(bus)
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
            this.currentBuses = this.buses;
        }
    }

    /**Launch add bus page*/
    async showAddBus() {
        let chooseModal = await this.modalCtrl.create({
            component: AddBusPage,
            componentProps: {
                busTypes: this.busTypes,
            }
        });
        chooseModal.onDidDismiss().then(data => {
            if (data.data) {
                this.loadBusesView();
            }
        });
        return await chooseModal.present();
    }

    /**Launch view bus page*/
    async showBus(bus: BusInfo) {
        let chooseModal = await this.modalCtrl.create({
            component: ViewBusPage,
            componentProps: {
                bus: bus
            }
        });
        chooseModal.onDidDismiss().then(data => {
            if (data.data) {
                this.loadBusesView();
            }
        });
        return await chooseModal.present();
    }

    /**Refresh View*/
    public refreshBusesView(event?) {
        this.loadBusesView(() => {
            if (event) {
                event.target.complete();
            }
        })
    }
    
    /**Load Buses View*/
    public loadBusesView(completed?: () => any) {

        /*Get Bus Types*/
        Api.getBusTypes((status, result) => {
            if (status) {
                if (this.assertAvailable(result)) {
                    this.busTypes = result.data;
                }
            }
        });

        /*Get buses*/
        Api.getBuses((status, result) => {
            if (status) {
                if (this.assertAvailable(result)) {
                    this.searchText = null;
                    this.buses = this.currentBuses = result.data;
                }
                else {
                    this.showToastMsg(Strings.getString("error_unexpected"), ToastType.ERROR);
                }
            }
            else {
                this.showToastMsg(result, ToastType.ERROR);
            }

            if (this.assertAvailable(completed)) {
                completed();
            }
        });
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
 }
