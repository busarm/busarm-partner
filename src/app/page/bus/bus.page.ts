import {Component} from '@angular/core';
import {AlertController, Events, ModalController} from "@ionic/angular";
import {Network} from "@ionic-native/network/ngx";
import {NetworkProvider} from "../../utils/NetworkProvider";
import {Api} from "../../utils/Api";
import {Strings} from "../../resources";
import {ToastType} from "../../utils/Utils";
import {BusType, BusInfo} from "../../models/ApiResponse";
import {PageController} from "../page-controller";
import {ViewBusPage} from "./view-bus/view-bus.page";
import {AddBusPage} from "./add-bus/add-bus.page";
import {EventsParams} from "../../utils/EventsParams";

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

        /*Online event*/
        this.events.subscribe(EventsParams.Online_Event, async () => {
            await this.hideToastMsg();
            if (!this.buses)
                this.loadBusesView();
        });

        /*Country Change event*/
        this.events.subscribe(EventsParams.CountryChangeSuccessEvent, async () => {
            this.loadBusesView();
        });
    }

    public async ionViewDidEnter(){

        /*Give time for components to load first*/
        this.setTimeout(() => {

            if (!this.buses)
                this.loadBusesView();

        }, 500);
    }

    /**Search input event
     * */
    public onInput(event,isSearch=false) {
        if (event.isTrusted) {
            this.searchText = event.target.value;
            if (this.assertAvailable(this.searchText) && this.searchText.length > 0) {
                if (isSearch) { //Only perform action if search pressed
                    if (this.assertAvailable(this.buses)) {
                        this.currentBuses = [];
                        for (let index in this.buses) {
                            let bus:BusInfo = this.buses[index];
                            let reg = new RegExp(this.searchText, 'gi');
                            if (bus.plate_num.match(reg)) {
                                this.currentBuses.push(bus)
                            }
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
            if (data.data === true) {
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
            if (data.data == true) {
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

    async loadImage(img){
        let image =  await NetworkProvider.getInstance().httpClient.get(this.buses[0].images[0].img+"ss", {
            responseType: "text",
            observe: 'events'
        });
        console.log(image);
    }
 }
