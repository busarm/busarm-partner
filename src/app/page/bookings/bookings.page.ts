import { Component, Input } from "@angular/core";
import { PageController } from "../page-controller";
import { ModalController } from "@ionic/angular";
import { Booking } from "../../models/Booking/Booking";
import { BookingTrip } from "../../models/Booking/BookingTrip";
import { ToastType } from "../../helpers/Utils";
import { Api } from "../../helpers/Api";
import { Strings } from "../../resources";
import { ViewBookingPage } from "./view-booking/view-booking.page";
import { Router, Params } from "@angular/router";

@Component({
  selector: "app-bookings",
  templateUrl: "./bookings.page.html",
  styleUrls: ["./bookings.page.scss"],
})
export class BookingsPage extends PageController {
  bookings: Booking[] = null;

  constructor(private modalCtrl: ModalController) {
    super();
  }

  public async ngOnInit() {
    await super.ngOnInit();

    /*Bookings updated event*/
    this.subscriptions.add(
      this.events.bookingsUpdated.asObservable().subscribe(async (id) => {
        await super.ngOnInit();
        if (id) {
          let params = await this.getRouteParams();
          if (params) {
            this.loadBookings(params.status, params.min_date, params.max_date);
          } else {
            this.loadBookings();
          }
        }
      })
    );

    let params = await this.getRouteParams();
    if (params) {
      this.loadBookings(params.status, params.min_date, params.max_date);
    } else {
      this.loadBookings();
    }
  }

  /**
   * Load Booking list
   */
  private async loadBookings(
    status?: number,
    min_date?: string,
    max_date?: string
  ) {
    Api.getBookings(
      String(status || ''),
      min_date || '',
      max_date || '',
      async ({ status, result, msg }) => {
        if (status) {
          this.bookings = result.data;
        } else if (!this.bookings) {
          await this.showToastMsg(msg, ToastType.ERROR);
          this.instance.routeService.goHome();
        }
      }
    );
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

  /**Search booking for booking id*/
  public findBooking(booking_id: string) {
    this.showLoading().then(() => {
      Api.getBooking(booking_id, ({ status, result, msg }) => {
        this.hideLoading();
        if (status) {
          if (this.assertAvailable(result)) {
            this.showBooking(result.data);
          } else {
            this.showToastMsg(
              Strings.getString("error_unexpected"),
              ToastType.ERROR
            );
          }
        } else {
          this.showToastMsg(msg, ToastType.ERROR);
        }
      });
    });
  }

  /**Launch Booking details*/
  async showBooking(booking: BookingTrip) {
    let chooseModal = await this.modalCtrl.create({
      component: ViewBookingPage,
      componentProps: {
        booking: booking,
      },
    });
    chooseModal.onDidDismiss().then((data) => {
      if (data.data) {
        this.loadBookings();
      }
    });
    return await chooseModal.present();
  }
}
