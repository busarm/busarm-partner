import { Component, Input } from "@angular/core";
import { ModalController, NavParams, Platform } from "@ionic/angular";
import {
    BusType,
    Country,
    Location,
    TicketInfo,
    TicketType,
    TripStatus,
} from "../../../models/ApiResponse";
import { DatePicker } from "@ionic-native/date-picker/ngx";
import { PageController } from "../../page-controller";
import { ToastType, Utils } from "../../../helpers/Utils";
import { Api } from "../../../helpers/Api";
import { Strings } from "../../../resources";
import { Events } from "../../../services/Events";
import { LocationsModal } from "../../locations/locations.modal";
import { AddTicketPage } from "../add-ticket/add-ticket.page";
import { DatePickerType, SelectDatePage } from "../../select-date/select-date.page";

declare var google: any;

@Component({
    selector: "app-add-trip",
    templateUrl: "./add-trip.page.html",
    styleUrls: ["./add-trip.page.scss"],
})
export class AddTripPage extends PageController {
    @Input() statusList: TripStatus[];
    @Input() busTypes: BusType[];
    @Input() ticketTypes: TicketType[];

    // Optional
    @Input() selectedPickup: Location;
    @Input() selectedDropOff: Location;
    @Input() selectedBusType: number;
    @Input() selectedStatus: number;
    @Input() selectedTickets: TicketInfo[] = [];

    //Min current day
    minDate: Date = new Date();

    //Max Plus 1 month
    maxDate: Date = new Date(
        this.minDate.getFullYear(),
        this.minDate.getMonth() + 1,
        this.minDate.getDate()
    );

    selectedDateTime: string = null;
    platform: Platform;

    constructor(
        private modalCtrl: ModalController,
        public navParams: NavParams,
        private datePicker: DatePicker,
        private events: Events,
        platform: Platform
    ) {
        super();
        this.platform = platform;
    }

    public async ngOnInit() {
        await super.ngOnInit();
    }

    public ionViewDidEnter() { 
        if(this.userInfo?.default_location) {
            this.selectedPickup = this.userInfo?.default_location;
        }
    }

    /**Launch native date picker*/
    public async showDatePicker() {
        this.datePicker
            .show({
                date: this.selectedDateTime
                    ? new Date(this.selectedDateTime)
                    : new Date(),
                minDate: this.minDate,
                maxDate: this.maxDate,
                mode: "datetime",
                androidTheme: this.datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
                allowOldDates: false,
                locale: this.userInfo ? this.userInfo.lang : "en",
            })
            .then(
                (date) => {
                    this.selectedDateTime = date.toISOString();
                },
                (err) => console.log("Error occurred while getting date: ", err)
            );
    }

    /**Launch select date model*/
    async showSelectDate() {
        let chooseModal = await this.modalCtrl.create({
            component: SelectDatePage,
            cssClass: 'date-modal',
            componentProps: {
                date: this.selectedDateTime
                    ? new Date(this.selectedDateTime)
                    : new Date(),
                minDate: this.minDate,
                maxDate: this.maxDate,
                type: DatePickerType.DateTime
            },
        });
        chooseModal.onDidDismiss().then((data) => {
            if (data.data) {
                this.selectedDateTime = new Date(data.data).toString();

            }
        });
        return await chooseModal.present();
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
            return (
                year +
                "-" +
                Utils.harold(month + 1) +
                "-" +
                Utils.harold(day) +
                " " +
                Utils.harold(hours) +
                ":" +
                Utils.harold(minutes) +
                ":" +
                Utils.harold(seconds)
            );
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
            return year + "-" + Utils.harold(month + 1) + "-" + Utils.harold(day);
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
            return (
                Utils.harold(hours) +
                ":" +
                Utils.harold(minutes) +
                ":" +
                Utils.harold(seconds)
            );
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
                this.selectLocation(
                    this.strings.getString("select_pickup_txt"),
                    (location: Location) => {
                        if (
                            ((this.session.configs.allow_international &&
                                this.userInfo.allow_international) ||
                                location.country_code == this.session.country.country_code ||
                                location.country_name == this.session.country.country_name) &&
                            (!this.selectedDropOff ||
                                location.loc_id != this.selectedDropOff.loc_id)
                        ) {
                            this.selectedPickup = location;
                        } else {
                            this.showToastMsg(
                                Strings.getString("invalid_location"),
                                ToastType.ERROR,
                                5000
                            );
                        }
                    }
                );
            }
        }
    }

    /**Select Destination place*/
    public async selectDestination(event) {
        if (event.isTrusted) {
            if (this.userInfo) {
                this.selectLocation(
                    this.strings.getString("select_dropoff_txt"),
                    (location: Location) => {
                        if (
                            ((this.session.configs.allow_international &&
                                this.userInfo.allow_international) ||
                                location.country_code == this.session.country.country_code ||
                                location.country_name == this.session.country.country_name) &&
                            (!this.selectedPickup ||
                                location.loc_id != this.selectedPickup.loc_id)
                        ) {
                            this.selectedDropOff = location;
                        } else {
                            this.showToastMsg(
                                Strings.getString("invalid_location"),
                                ToastType.ERROR,
                                5000
                            );
                        }
                    }
                );
            }
        }
    }

    /**Add ticket*/
    public async addTicket() {
        if (this.userInfo) {
            await this.showAddTicket(this.session.country, (ticket) => {
                let found = this.selectedTickets.some((selectedTicket, index) => {
                    if (selectedTicket.type_id == ticket.type_id) {
                        this.selectedTickets[index] = ticket;
                        return true;
                    }
                    return false;
                });
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
                selector: true,
            },
        });
        chooseModal.onDidDismiss().then((data) => {
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
                country: country,
            },
        });
        chooseModal.onDidDismiss().then((data) => {
            if (data.data) {
                callback(data.data);
            }
        });
        return await chooseModal.present();
    }

    /**Submit form*/
    public submit() {
        this.showLoading().then(() => {
            Api.addNewTrip(
                this.selectedPickup.loc_id,
                this.selectedDropOff.loc_id,
                this.selectedDateTime ? new Date(this.selectedDateTime).toISOString() : null,
                this.selectedBusType,
                this.selectedStatus,
                this.selectedTickets,
                (status, result) => {
                    if (status) {
                        this.hideLoading();
                        if (this.assertAvailable(result)) {
                            this.showToastMsg(result.msg, ToastType.SUCCESS);
                            this.events.tripsUpdated.emit(true);
                            this.dismiss();
                        } else {
                            this.showToastMsg(
                                Strings.getString("error_unexpected"),
                                ToastType.ERROR
                            );
                        }
                    } else {
                        this.hideLoading();
                        this.showToastMsg(result, ToastType.ERROR);
                    }
                }
            );
        });
    }

    /**Convert to string*/
    public toJson(data: any) {
        return Utils.toJson(data);
    }

    /**Close Modal*/
    async dismiss() {
        const modal = await this.modalCtrl.getTop();
        if (modal) modal.dismiss();
    }
}
