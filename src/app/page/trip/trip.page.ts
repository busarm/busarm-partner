import {Component} from '@angular/core';
import {AlertController, ModalController} from "@ionic/angular";
import {Network} from "@ionic-native/network/ngx";
import {Api} from "../../libs/Api";
import {Strings} from "../../resources";
import {ToastType, Utils} from "../../libs/Utils";
import {
    BusType,
    TicketType,
    TripInfo,
    TripStatus
} from "../../models/ApiResponse";
import {PageController} from "../page-controller";
import {ViewTripPage} from "./view-trip/view-trip.page";
import {AddTripPage} from "./add-trip/add-trip.page";
import { Events } from '../../services/Events';

@Component({
    selector: 'app-trip',
    templateUrl: './trip.page.html',
    styleUrls: ['./trip.page.scss'],
})
export class TripPage extends PageController{

    // Current
    currentDate: Date = new Date();

    //Max Plus 1 month
    maxDate: Date = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1);

    //Min - Max Minus 1 year
    minDate: Date = new Date(
        this.maxDate.getFullYear() - 1,
        this.maxDate.getMonth());

    selectedDate: string = null;
    searchText: string = null;
    trips: TripInfo[] = null;
    currentTrips: TripInfo[] = null;
    statusList: TripStatus[] = null;
    busTypes: BusType[] = null;
    ticketTypes: TicketType[] = null;

    constructor(public alertCtrl: AlertController,
                public modalCtrl: ModalController,
                public events: Events,
                public network: Network) {
        super();
    }

    public async ngOnInit() {
        await super.ngOnInit();

        /*Network event*/
        this.events.getNetworkObservable().subscribe(async (online) => {
            await super.ngOnInit();
            if (online) {
                await this.hideToastMsg();
                if (!this.trips) {
                    this.loadTripsView();
                }
            }
        });

        /*Contry Changed event*/
        this.events.getCountryChangeObservable().subscribe(async (changed) => {
            await super.ngOnInit();
            if (changed) {
                this.loadTripsView();
            }
            else {
                /*Set default country*/
                this.selectedCountry = this.session.country.country_code;
            }
        });

        // Set date
        this.selectedDate = this.getDateString(this.currentDate);
    } 

    public ngOnDestroy(){
        this.trips = null;
        super.ngOnDestroy();
    }

    public async ionViewDidEnter(){
        if (!this.trips){
            this.loadTripsView();
        }
    }

    /**Search input event
     * */
    public onInput(event,isSearch?) {
        if (event.isTrusted) {
            this.searchText = event.target.value;
            if (this.assertAvailable(this.searchText) && this.searchText.length > 1) {
                if (this.assertAvailable(this.trips)) {
                    this.currentTrips = [];
                    for (let index in this.trips) {
                        let trip = this.trips[index];
                        let reg = new RegExp(this.searchText, 'gi');
                        if (trip.pickup_loc_name.match(reg) ||
                            trip.pickup_city.match(reg) ||
                            trip.dropoff_loc_name.match(reg) ||
                            trip.dropoff_city.match(reg) ||
                            trip.agent_email.match(reg)) {

                            this.currentTrips.push(trip)
                        }
                    }
                }
            }
            else {
                this.onClear(event);
            }
        }
    }

    /**Return Date string for selected date
     * */
    public getDateString(selectedDate: Date) {
        if (Utils.assertAvailable(selectedDate)) {
            let year = selectedDate.getFullYear(),
                month = selectedDate.getMonth(),
                day = selectedDate.getDate();
            return year + "-" + Utils.harold(month + 1) + "-" + Utils.harold(day)
        }
        return null;
    }

    /**Reset Search bar*/
    public onClear(event) {
        if (event.isTrusted) {
            this.searchText = null;
            this.currentTrips = this.trips;
        }
    }

    /**Launch add trip page*/
    async showAddTrip() {
        let chooseModal = await this.modalCtrl.create({
            component: AddTripPage,
            componentProps: {
                statusList: this.statusList,
                busTypes: this.busTypes,
                ticketTypes: this.ticketTypes,
            }
        });
        chooseModal.onDidDismiss().then(data => {
            if (data.data) {
                this.loadTripsView();
            }
        });
        return await chooseModal.present();
    }



    /**Launch view trip page*/
    async showTrip(trip: TripInfo) {
        let chooseModal = await this.modalCtrl.create({
            component: ViewTripPage,
            componentProps: {
                trip: trip
            }
        });
        chooseModal.onDidDismiss().then(data => {
            if (data.data) {
                this.loadTripsView();
            }
        });
        return await chooseModal.present();
    }

    /**Clear date*/
    public clearDate() {
        this.selectedDate = null
    }
    
    /**Refresh View*/
    public refreshTripsView(event?) {
        this.loadTripsView(() => {
            if (event) {
                event.target.complete();
            }
        });
    }

    /**Load Trips View*/
    public loadTripsView(completed?: () => any) {

        /*Get Trip status*/
        Api.getTripStatusList((status, result) => {
            if (status) {
                if (this.assertAvailable(result)) {
                    this.statusList = result.data;
                }
            }
        });

        /*Get Bus Types*/
        Api.getPartnerBusTypes((status, result) => {
            if (status) {
                if (this.assertAvailable(result)) {
                    this.busTypes = result.data;
                }
            }
        });

        /*Get Ticket Types*/
        Api.getTicketTypes((status, result) => {
            if (status) {
                if (this.assertAvailable(result)) {
                    this.ticketTypes = result.data;
                }
            }
        });

        /*Get trips*/
        Api.getTrips(this.selectedDate?this.getDateString(new Date(this.selectedDate)):'', (status, result) => {
            if (status) {
                if (this.assertAvailable(result)) {
                    this.searchText = null;
                    this.trips = this.currentTrips = result.data;
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


    /**Get Status class for trip status*/
    public getTripStatusClass(status: string): string {
        if (this.assertAvailable(status)) {
            switch (status) {
                case "2":
                default:
                    return "status-default";
                case "3":
                    return "status-cancel";
                case "7":
                    return "status-ok";
                case "8":
                    return "status-warn";
            }
        }
    }
}
