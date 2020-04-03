import {Component, Input} from '@angular/core';
import {BookingInfo, TripInfo} from "../../../models/ApiResponse";
import {PageController} from "../../page-controller";
import {ModalController} from "@ionic/angular";
import {ViewTripPage} from "../../trip/view-trip/view-trip.page";
import {ToastType} from "../../../libs/Utils";
import {Strings} from "../../../resources";
import {Api} from "../../../libs/Api"; 

@Component({
  selector: 'app-view-booking',
  templateUrl: './view-booking.page.html',
  styleUrls: ['./view-booking.page.scss'],
})

export class ViewBookingPage extends PageController {

    @Input() bookingInfo: BookingInfo = null;
    activeBookingSegment: string = "summary";

    constructor(private modalCtrl: ModalController) {
        super();
    }

    public async ngOnInit() {
        await super.ngOnInit();
        if (this.bookingInfo==null){
            this.instance.goHome();
        }
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


    /**Show booking confirmation verification
     * on button click
     * */
    public confirmVerify() {
        this.showAlert(
            this.strings.getString("verify_booking_txt"),
            this.strings.getString("confirm_verify_msg"),
            {
                title: this.strings.getString("no_txt")
            },
            {
                title: this.strings.getString("yes_txt"),
                callback: () => {
                    this.verifyBooking(this.bookingInfo.booking_id);
                }
            },
        );
    }

    /**Verify booking*/
    public verifyBooking(bookingId: string) {
        this.showLoading().then(()=>{
            Api.verifyUserBooking(bookingId, async (status, result) => {
                if (status) {

                    //Save user data to session
                    if (this.assertAvailable(result)) {
                        this.showToastMsg(result.msg, ToastType.SUCCESS);
                        await this.hideLoading();
                        await this.dismiss(true);
                    }
                    else {
                        this.showToastMsg(Strings.getString("error_unexpected"), ToastType.ERROR);
                        await this.hideLoading();
                    }
                }
                else {
                    this.showToastMsg(result, ToastType.ERROR);
                    await this.hideLoading();
                }
            });
        });

    }


    /**Launch add trip page*/
    async showTrip(trip: TripInfo) {
        let chooseModal = await this.modalCtrl.create({
            component: ViewTripPage,
            componentProps: {
                trip: trip
            }
        });
        return await chooseModal.present();
    }

    async dismiss(success = false){
        const modal = await this.modalCtrl.getTop();
        if(modal)
            modal.dismiss(success);
    }
}
