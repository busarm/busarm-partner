import { Component } from "@angular/core";
import { PageController } from "../page-controller";
import { MenuController, ModalController } from "@ionic/angular";
import { Router, RouterEvent } from "@angular/router";
import { Api } from "../../helpers/Api";
import { ScannerService } from "../../services/app/ScannerService";
import { ToastType } from "../../services/app/AlertService";
import { ViewBookingPage } from "../bookings/view-booking/view-booking.page";
import { BookingTrip } from "../../models/Booking/BookingTrip";

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
})
export class HomePage extends PageController {
  public selectedPage: string = "";

  private referenceCode: string = null;
  private isBookingShowing: boolean = false;
  private isFindBookingProcessing: boolean = false;

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private menu: MenuController,
    private scannerService: ScannerService
  ) {
    super();
  }

  /**Set Selected Url*/
  private setSelectedUrl(url: string) {
    if (this.assertAvailable(url) && url.startsWith("/home/")) {
      this.selectedPage = url;
    }
  }

  public async ngOnInit() {
    await super.ngOnInit();

    this.setSelectedUrl(this.router.url);
    this.router.events.subscribe((event: RouterEvent) => {
      if (event && event.url && this.router.url == event.url) {
        this.setSelectedUrl(event.url);
      }
    });
    this.menu.enable(true, "home");


    /*Web scanner event*/
    this.subscriptions.add(
      this.events.webScannerCompleted.asObservable().subscribe(async (code) => {
        if (this.referenceCode !== code) {
          this.referenceCode = code;
          this.findBooking();
        }
      })
    );
  }

  public async ionViewDidEnter() {}

  public willChange(event: any) {
    this.selectedPage = event.tab;
  }

  /**Show Logout confirmation
   * */
  public confirmLogout() {
    this.showAlert(
      this.strings.getString("logout_txt"),
      this.strings.getString("logout_msg_txt"),
      {
        title: this.strings.getString("no_txt"),
      },
      {
        title: this.strings.getString("yes_txt"),
        callback: () => {
          this.logout();
        },
      }
    );
  }

  /**Logout user*/
  public logout() {
    this.showLoading().then(() => {
      Api.logout(() => {
        this.instance.authService.logout();
        this.hideLoading();
      });
    });
  }

  /**Launch scan Qr Code
   */
  async showScanCode() {
    this.scannerService.showScanCode();
  }

  /**
   * Search booking for reference number
   */
  private findBooking() {
    if (this.referenceCode && !this.isFindBookingProcessing) {
      this.isFindBookingProcessing = true;
      this.showLoading().then(() => {
        Api.validateBooking(this.referenceCode, ({ status, result, msg }) => {
          this.hideLoading();
          this.isFindBookingProcessing = false;
          if (status) {
            if (this.assertAvailable(result)) {
              this.showBooking(result.data);
            } else {
              this.referenceCode = null;
              this.showToastMsg(
                this.strings.getString("error_unexpected"),
                ToastType.ERROR
              );
            }
          } else {
            this.referenceCode = null;
            this.showToastMsg(msg, ToastType.ERROR);
          }
        });
      });
    }
  }

  /**Launch Booking details
   * @param {BookingTrip} booking
   * @return {Promise<any>}
   */
  async showBooking(booking: BookingTrip): Promise<any> {
    if (this.isBookingShowing) return;
    let chooseModal = await this.modalCtrl.create({
      component: ViewBookingPage,
      componentProps: {
        booking: booking,
      },
    });
    chooseModal.onDidDismiss().then(() => {
      this.referenceCode = null;
      this.isBookingShowing = false;
    });
    return await chooseModal.present().then(() => {
      this.isBookingShowing = true;
    });
  }
}
