import { Component, Input } from '@angular/core';
import { TripSeat } from "../../../models/Trip/TripSeat";
import { Trip } from "../../../models/Trip/Trip";
import { BookingTrip } from "../../../models/Booking/BookingTrip";
import { PageController } from "../../page-controller";
import { ModalController } from "@ionic/angular";
import { ViewTripPage } from "../../trip/view-trip/view-trip.page";
import { ToastType } from "../../../helpers/Utils";
import { Strings } from "../../../resources";
import { Api } from "../../../helpers/Api";

@Component({
  selector: 'app-view-booking',
  templateUrl: './view-booking.page.html',
  styleUrls: ['./view-booking.page.scss'],
})

export class ViewBookingPage extends PageController {

  @Input() booking: BookingTrip = null;
  activeBookingSegment: string = "summary";

  constructor(private modalCtrl: ModalController) {
    super();
  }

  public async ngOnInit() {
    await super.ngOnInit();
    if (this.booking == null) {
      this.instance.goHome();
    }
  }

  public ngOnDestroy() {
    this.booking = null;
    super.ngOnDestroy();
  }

  /**Get Status class for booking status*/
  public getBookingSeatsText(seats: TripSeat[]): string {
    let text = '';
    seats.forEach((seat, index) => {
      if (index == 0) {
        text += (seat.seat_id);
      }
      else {
        text += (', ' + seat.seat_id);
      }
    })
    return text.trim();
  }

  /**Get Status class for booking status*/
  public getBookingStatusClass(status: string): string {
    if (this.assertAvailable(status)) {
      switch (status) {
        case "9":
          return "status-cancel";
        case "12":
          return "status-warn";
        case "13":
          return "status-default";
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
          this.verifyBooking(this.booking.booking_id);
        }
      },
    );
  }

  /**Verify booking*/
  public verifyBooking(bookingId: string) {
    this.showLoading().then(() => {
      Api.verifyUserBooking(bookingId, async (status, result) => {
        if (status) {
          //Save user data to session
          if (this.assertAvailable(result)) {
            this.showToastMsg(result.msg, ToastType.SUCCESS);
            await this.hideLoading();
            this.events.bookingsUpdated.next(bookingId);
            this.dismiss();
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
  async showTrip(trip: Trip) {
    let chooseModal = await this.modalCtrl.create({
      component: ViewTripPage,
      componentProps: {
        trip: trip
      }
    });
    return await chooseModal.present();
  }

  async dismiss() {
    const modal = await this.modalCtrl.getTop();
    if (modal)
      modal.dismiss();
  }
}
