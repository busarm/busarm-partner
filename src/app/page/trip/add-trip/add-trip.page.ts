import {Component, Input} from '@angular/core';
import {ModalController, NavParams, Platform} from "@ionic/angular";
import {BusType, Country, Location, LocationType, TicketInfo, TicketType,  TripStatus} from "../../../models/ApiResponse";
import {DatePicker} from "@ionic-native/date-picker/ngx";
import {PageController} from "../../page-controller";
import {AddTicketPage} from "../add-ticket/add-ticket.page";
import {ToastType, Utils} from "../../../libs/Utils";
import {Api} from "../../../libs/Api";
import {Strings} from "../../../resources";
import { LocationsModal } from '../../locations/locations.modal';

declare var google: any;

@Component({
    selector: 'app-add-trip',
    templateUrl: './add-trip.page.html',
    styleUrls: ['./add-trip.page.scss'],
})
export class AddTripPage extends PageController {

    @Input() statusList: TripStatus[];
    @Input() busTypes: BusType[];
    @Input() ticketTypes: TicketType[];

    //Min current day
    minDate: Date = new Date();

    //Max Plus 1 month
    maxDate: Date = new Date(
        this.minDate.getFullYear(),
        this.minDate.getMonth() + 1,
        this.minDate.getDate());

    selectedPickup: Location;
    selectedPickupLocationType: number;
    selectedDropOff: Location;
    selectedDropOffLocationType: number;
    selectedStatus: number;
    selectedBusType: number;
    selectedDateTime: string = null;
    selectedDate: string = null;
    selectedTIme: string = null;
    selectedTickets: TicketInfo[] = [];
    platform: Platform;

    constructor(private modalCtrl: ModalController,
                public navParams: NavParams,
                private datePicker: DatePicker,
                platform: Platform,
    ) {
        super();
        this.platform = platform;
    }

    public async ngOnInit() {
        await super.ngOnInit();

        //Load google api if not available
        if (typeof google === 'undefined') {
            if (this.session && this.session.configs && this.session.configs.google_api_key){
                Utils.loadGoogleApi(this.session.configs.google_api_key);
            }
        }
    }
    public ionViewDidEnter(){}

    public async showDatePicker() {
        this.datePicker
            .show({
                date: new Date(),
                minDate: this.minDate,
                maxDate: this.maxDate,
                mode: 'datetime',
                androidTheme: this.datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
                allowOldDates: false,
                locale: this.userInfo?this.userInfo.lang:"en"
            })
            .then(date => {
                    this.selectedDateTime = this.getDateTimeString(date);
                }, err => console.log('Error occurred while getting date: ', err)
            );
    }

    /**Return Date and time string for selected date
     * */
    public getDateTimeString(selectedDate: Date) {
        if (Utils.assertAvailable(selectedDate)) {
            let year = selectedDate.getFullYear(),
                month = selectedDate.getMonth(),
                day = selectedDate.getDate(),
                hours = selectedDate.getHours(),
                minutes = selectedDate.getMinutes(),
                seconds = selectedDate.getSeconds();
            return year + "-" + Utils.harold(month + 1) + "-" + Utils.harold(day) + " " + Utils.harold(hours) + ":" + Utils.harold(minutes) + ":" + Utils.harold(seconds)
        }
        return null;
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

    /**Return time string for selected date
     * */
    public getTimeString(selectedDate: Date) {
        if (Utils.assertAvailable(selectedDate)) {
            let hours = selectedDate.getHours(),
                minutes = selectedDate.getMinutes(),
                seconds = selectedDate.getSeconds();
            return Utils.harold(hours) + ":" + Utils.harold(minutes) + ":" + Utils.harold(seconds)
        }
        return null;
    }

    /**Return Year
     * */
    public getYear(date: Date) {
        if (Utils.assertAvailable(date)) {
            return date.getFullYear();
        }
        return null;
    }

    /**Return Month
     * */
    public getMonth(date: Date) {
        if (Utils.assertAvailable(date)) {
            return Utils.harold(date.getMonth() + 1);
        }
        return null;
    }

    /**Return Day
     * */
    public getDay(date: Date) {
        if (Utils.assertAvailable(date)) {
            return Utils.harold(date.getDate());
        }
        return null;
    }

    /**Select Origin place*/
    public async selectOrigin(event) {
        if (event.isTrusted) {
            if (this.userInfo) {
                this.selectLocation(this.strings.getString('select_pickup_txt'), location => {
                    if (this.userInfo.allow_international || (location.country_code == this.session.country.country_code || location.country == this.session.country.country_name)){
                        this.selectedPickup = location
                    }
                    else {
                        this.showToastMsg(Strings.getString("invalid_location"), ToastType.ERROR);
                    }
                });
            }
        }
    }

    /**Select Destination place*/
    public async selectDestination(event) {
        if (event.isTrusted) {
            if (this.userInfo) {
                this.selectLocation(this.strings.getString('select_dropoff_txt'), (location: Location) => {
                    if (this.userInfo.allow_international || (location.country_code == this.session.country.country_code || location.country_name == this.session.country.country_name)){
                        this.selectedDropOff = location
                    }
                    else {
                        this.showToastMsg(Strings.getString("invalid_location"), ToastType.ERROR);
                    }
                });
            }
        }
    }

    /**Add ticket*/
    public async addTicket() {
        if (this.userInfo) {
            await this.showAddTicket(this.session.country, ticket => {
                let found = this.selectedTickets.some((selectedTicket, index) => {
                    if (selectedTicket.type_id == ticket.type_id) {
                        this.selectedTickets[index] = ticket;
                        return true;
                    }
                    return false;
                })
                if (!found) {
                    this.selectedTickets.push(ticket);
                }
            });
        }
    }

    /**Remove ticket*/
    public removeTicket(position: number) {
        if (this.selectedTickets != null && this.selectedTickets.length > 0) {
            this.selectedTickets.splice(position, 1);
        }
    }

    /**Launch location selector*/
    async selectLocation(title: string, callback: (place: any) => any) {
        let chooseModal = await this.modalCtrl.create({
            component: LocationsModal,
            componentProps: {
                title: title,
                selector: true
            }
        });
        chooseModal.onDidDismiss().then(data => {
            if (data.data) {
                callback(data.data);
            }
        });
        return await chooseModal.present();
    }


    /**Launch Add ticket view*/
    async showAddTicket(country: Country, callback: (place: TicketInfo) => any) {

        let chooseModal = await this.modalCtrl.create({
            component: AddTicketPage,
            componentProps: {
                ticketTypes: this.ticketTypes,
                country: country
            }
        });
        chooseModal.onDidDismiss().then(data => {
            if (data.data) {
                callback(data.data);
            }
        });
        return await chooseModal.present();
    }


    /**Submit form*/
    public submit() {
        let date = this.selectedDateTime;
        if (!Utils.assertAvailable(date)) {
            date = this.getDateString(new Date(this.selectedDate)) +
                " " + this.getTimeString(new Date(this.selectedTIme))
        }

        this.showLoading().then(() => {
            Api.addNewTrip(
                this.selectedPickup.loc_id,
                this.selectedDropOff.loc_id,
                date,
                this.selectedBusType,
                this.selectedStatus,
                this.selectedTickets,
                (status, result) => {
                    if (status) {
                        this.hideLoading();
                        if (this.assertAvailable(result)) {
                            this.showToastMsg(result.msg, ToastType.SUCCESS);
                            this.dismiss(true);
                        }
                        else {
                            this.showToastMsg(Strings.getString("error_unexpected"), ToastType.ERROR);
                        }
                    }
                    else {
                        this.hideLoading();
                        this.showToastMsg(result, ToastType.ERROR);
                    }
                });
        });
    }

    /**Convert to string*/
    public toJson(data: any) {
        return Utils.toJson(data);
    }

    /**Close Modal*/
    async dismiss(success?: boolean) {
        const modal = await this.modalCtrl.getTop();
        if(modal)
            modal.dismiss(success);
    }
}