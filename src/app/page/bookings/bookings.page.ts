import {Component, Input} from '@angular/core';
import {PageController} from "../page-controller";
import {ModalController, NavController} from "@ionic/angular";
import {Booking, BookingInfo} from "../../models/ApiResponse";
import {ToastType} from "../../utils/Utils";
import {Api} from "../../utils/Api";
import {Strings} from "../../resources";
import {ViewBookingPage} from "../view-booking/view-booking.page";

@Component({
    selector: 'app-bookings',
    templateUrl: './bookings.page.html',
    styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage extends PageController {

    @Input() bookings: Booking[] = null;

    constructor(private modalCtrl: ModalController, public navCtrl: NavController) {
        super();
    }

    public async ngOnInit() {}

    public ionViewDidEnter() {
        if (this.bookings==null){
            this.dismiss()
        }
    }

    dismiss(success = false){
        this.modalCtrl.dismiss(success)
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

    /**Search booking for booking id*/
    public findBooking(booking_id: string) {
        this.showLoading().then(()=>{
            Api.getBookingInfo(booking_id, (status, result) => {
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

    /**Launch Booking details*/
    async showBooking(bookingInfo:BookingInfo){
        let chooseModal = await this.modalCtrl.create({
            component: ViewBookingPage,
            componentProps: {
                bookingInfo: bookingInfo
            }
        });
        chooseModal.onDidDismiss().then((data) => {
            if (data.data) {
                return this.dismiss(true);
            }
        });
        return await chooseModal.present();
    }
}
