import {Component, ElementRef, ViewChild} from '@angular/core';
import {PageController} from "../page-controller";
import {AlertController, Events, ModalController, NavController, Platform} from "@ionic/angular";
import {
    Booking,
    BookingInfo,
    BookingMonth,
    Dashboard,
    PayInTransaction,
    PayOutTransaction,
    TripInfo
} from "../../models/ApiResponse";
import {ToastType, Utils} from "../../utils/Utils";
import {Api} from "../../utils/Api";
import {Strings} from "../../resources";
import {ConnectionStatusEvents} from "../../utils/NetworkProvider";
import {ViewTripPage} from "../view-trip/view-trip.page";
import {BarcodeScanner} from "@ionic-native/barcode-scanner/ngx";
import { Chart } from 'chart.js';
import {BookingsPage} from "../bookings/bookings.page";
import {ViewBookingPage} from "../view-booking/view-booking.page";
import {PayoutPage} from "../payout/payout.page";
import {PayInPage} from "../pay-in/pay-in.page";

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.page.html',
    styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage extends PageController {

    @ViewChild('dashCards') container: ElementRef;

    referenceCode: string = null;
    selectedBookingMonth: number = 0;
    dashboard: Dashboard = null;
    bookingMonths: BookingMonth[] = null;
    platform: Platform;

    constructor(public navCtrl: NavController,
                public alertCtrl: AlertController,
                public modalCtrl: ModalController,
                public events: Events,
                private barcodeScanner: BarcodeScanner,
                platform: Platform) {
        super();
        this.platform = platform;
    }

    public async ngOnInit() {
        await super.ngOnInit();
        console.log("Dashboard Loaded");
    }

    public async ionViewDidEnter(){

        //Give time for components to load first
        this.setTimeout(() => {

            if (!this.dashboard)
                this.loadDashboardView();

            /*Online event*/
            this.events.subscribe(ConnectionStatusEvents.Online_Event, async () => {
                await this.hideToastMsg();
                if (!this.dashboard)
                    this.loadDashboardView();
            });

        }, 500);

    }

    /** Set up dashboard contents
     * */
    private alertShowing = false;
    public async initDashboard(){

        if (this.dashboard) {
            if (this.dashboard.alert && this.dashboard.alert.status){
                let toastType: ToastType = ToastType.NORMAL;
                let duration = 0;
                switch (this.dashboard.alert.type){
                    case "success":
                        toastType = ToastType.SUCCESS;
                        duration = 4000;
                        break;
                    case "warning":
                        toastType = ToastType.WARNING;
                        duration = 6000;
                        break;
                    case "danger":
                        toastType = ToastType.ERROR;
                        break;
                    case "cancel":
                        toastType = ToastType.NORMAL;
                        break;
                }
                if (!this.alertShowing) {
                    this.alertShowing = true;
                    await this.showToastMsg(
                        this.dashboard.alert.desc,
                        toastType,
                        duration, true,
                        Utils.convertHTMLEntity("&times;"),
                        () => {
                            this.alertShowing = false
                        });
                }
            }

            this.bookingMonths = [];
            this.bookingMonths.push({
                min_date:"",
                max_date:"",
                display_date:this.strings.getString('all_months_txt'),
            });
            this.dashboard.booking_months.forEach((month: BookingMonth) => {
                this.bookingMonths.push(month)
            });

            setTimeout(()=>{
                /*Active Trips*/
                if (this.dashboard.active_trips) {
                    this.dashboard.active_trips.forEach((trip: TripInfo) => {
                        let element = (<any>document.getElementById('canvas_' + trip.trip_id));
                        if (element) {
                            new Chart(element.getContext('2d'), {
                                type: 'pie',
                                data: {
                                    labels: [this.strings.getString("booked_txt"), this.strings.getString("available_txt")],
                                    datasets: [{
                                        data: [parseInt(trip.booked_seats), parseInt(trip.available_seats)],
                                        backgroundColor: [
                                            'rgba(84, 142, 171,1)',
                                            'rgba(223, 99, 45,1)',
                                        ],
                                        hoverBackgroundColor: [
                                            "rgb(56, 89, 115)",
                                            "rgb(155, 70, 32)",
                                        ]
                                    }]
                                }

                            }).update();
                        }

                    });
                }

                /*Bookings*/
                if (this.dashboard.bookings) {
                    let element = (<any>document.getElementById('canvas_bookings'));
                    if (element) {
                        new Chart(element.getContext('2d'), {
                            type: 'doughnut',
                            data: {
                                labels: [
                                    this.strings.getString("unpaid_txt"),
                                    this.strings.getString("pending_txt"),
                                    this.strings.getString("verified_txt"),
                                    this.strings.getString("canceled_txt"),
                                ],
                                datasets: [{
                                    data: [
                                        this.dashboard.bookings.unpaid.length,
                                        this.dashboard.bookings.pending.length,
                                        this.dashboard.bookings.verified.length,
                                        this.dashboard.bookings.canceled.length,
                                    ],
                                    backgroundColor: [
                                        'rgba(223, 99, 45,1)',
                                        'rgba(223, 168, 48,1)',
                                        'rgb(46, 139, 87)',
                                        '#5f5f5f',
                                    ],
                                    hoverBackgroundColor: [
                                        'rgb(155, 70, 32)',
                                        'rgb(155, 115, 40)',
                                        'rgb(35, 107, 67)',
                                        '#373737',
                                    ]
                                }]
                            }

                        }).update();
                    }
                }
            },500);

        }
    }

    /**Launch add trip page*/
    async showTrip(trip: TripInfo) {
        let chooseModal = await this.modalCtrl.create({
            component: ViewTripPage,
            componentProps: {
                trip: trip
            }
        });
        chooseModal.onDidDismiss().then(data => {
            if (data.data) {
                this.loadDashboardView();
            }
        });
        return await chooseModal.present();
    }

    /**Launch payin page*/
    async showPayIn(payin: PayInTransaction) {
        let chooseModal = await this.modalCtrl.create({
            component: PayInPage,
            componentProps: {
                payIn: payin
            }
        });
        chooseModal.onDidDismiss().then(data => {
            if (data.data) {
                this.loadDashboardView();
            }
        });
        return await chooseModal.present();
    }

    /**Launch payout page*/
    async showPayout(payout: PayOutTransaction) {
        let chooseModal = await this.modalCtrl.create({
            component: PayoutPage,
            componentProps: {
                payout: payout
            }
        });
        chooseModal.onDidDismiss().then(data => {
            if (data.data) {
                this.loadDashboardView();
            }
        });
        return await chooseModal.present();
    }

    /**Launch scan Qr Code page
     * */
    showScanCode() {
        this.barcodeScanner.scan({
            resultDisplayDuration: 0,
            disableSuccessBeep: false,
            showTorchButton:true
        }).then(barcodeData => {
            if (Utils.assertAvailable(barcodeData.text)) {
                this.referenceCode = barcodeData.text;
                this.findBooking(this.referenceCode);
            }
        }).catch(e => {
            this.showToastMsg(e, ToastType.ERROR);
        });
    }

    /**Search input event
     * */
    public onInput(event,isSearch=false) {
        if (event.isTrusted) {
            this.referenceCode = event.target.value;
            if (this.assertAvailable(this.referenceCode) && this.referenceCode.length > 0) {
                if (isSearch) { //Only perform action if search pressed
                    this.referenceCode = this.referenceCode.toUpperCase();
                    if (this.referenceCode.length >= 6) {
                        this.findBooking(this.referenceCode);
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
            this.referenceCode = null;
        }
    }

    /**Refresh View*/
    public refreshDashboardView(event?) {
        this.loadDashboardView(() => {
            if (event) {
                this.onClear(event);
                event.target.complete();
            }
        })
    }

    /**Get Status class for booking status*/
    public getBookingStatusClass(status: string): string {
        if (this.assertAvailable(status)) {
            switch (status) {
                case "9":
                    return "status-cancel";
                case "12":
                    return "status-warn";
                case "11":
                    return "status-ok";
                case "10":
                default:
                    return "status-error";
            }
        }
    }

    /**Launch view bookings*/
    async showBookings(bookings: Booking[]) {
        if (bookings && bookings.length > 0) {
            let chooseModal = await this.modalCtrl.create({
                component: BookingsPage,
                componentProps: {
                    bookings: bookings
                }
            });
            chooseModal.onDidDismiss().then((data) => {
                if (data.data) {
                    return this.loadDashboardView();
                }
            });
            return await chooseModal.present();
        }
        else {
            return this.showToastMsg(Strings.getString("no_booking_txt"), ToastType.ERROR);
        }
    }


    /**Launch Booking details*/
    async showBooking(bookingInfo:BookingInfo){
        let chooseModal = await this.modalCtrl.create({
            component: ViewBookingPage,
            componentProps: {
                bookingInfo: bookingInfo
            }
        });
        chooseModal.onDidDismiss().then(() => {
            this.referenceCode = null;
            return this.loadDashboardView();
        });
        return await chooseModal.present();
    }

    /**Search booking for reference number*/
    private findBooking(ref_code: string) {
        this.showLoading().then(()=>{
            Api.getBookingInfo(ref_code, (status, result) => {
                this.hideLoading();
                if (status) {
                    if (this.assertAvailable(result)) {
                        this.showBooking(result.data);
                    }
                    else {
                        this.showToastMsg(Strings.getString("error_unexpected"), ToastType.ERROR);
                    }
                }
                else {
                    this.showToastMsg(result, ToastType.ERROR);
                }
            });
        });
    }

    /**Load Active Trips View*/
    public async loadDashboardView(completed?: () => any) {
        let min_date = this.bookingMonths?this.bookingMonths[this.selectedBookingMonth].min_date:"";
        let max_date = this.bookingMonths?this.bookingMonths[this.selectedBookingMonth].max_date:"";
        Api.getDashboard(min_date,max_date,async (status, result) => {
            if (status) {

                //Save user data to session
                if (this.assertAvailable(result)) {
                    if (result.data) {
                        this.dashboard = result.data;
                        await this.initDashboard();
                    }
                }
                else {
                    await this.showToastMsg(Strings.getString("error_unexpected"), ToastType.ERROR);
                }
            }
            else {
                await this.showToastMsg(result, ToastType.ERROR);
            }

            if (this.assertAvailable(completed)) {
                completed();
            }
        });
    }
}
