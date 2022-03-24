import { Component, ElementRef, ViewChild } from '@angular/core';
import { PageController } from "../page-controller";
import { ModalController, Platform } from "@ionic/angular";
import {
  Booking,
  BookingInfo,
  BookingMonth,
  Dashboard,
  PayInTransaction,
  PayOutTransaction,
  TripInfo
} from "../../models/ApiResponse";
import { ToastType, Utils } from "../../helpers/Utils";
import { Api } from "../../helpers/Api";
import { Strings } from "../../resources";
import { ViewTripPage } from "../trip/view-trip/view-trip.page";
import { BarcodeScanner } from "@ionic-native/barcode-scanner/ngx";
import { Chart } from 'chart.js';
import { ViewBookingPage } from "../bookings/view-booking/view-booking.page";
import { Events } from '../../services/Events';
import { MD5 } from 'crypto-js';
import { ENVIRONMENT } from '../../../environments/environment';
import { ENV } from '../../../environments/ENV';
// import { WebScannerPage } from './web-scanner/web-scanner.page';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage extends PageController {

  @ViewChild('bookingCanvas') bookingCanvas: ElementRef<HTMLCanvasElement>;

  referenceCode: string = null;
  selectedBookingMonth: number = 0;
  dashboard: Dashboard = null;
  bookingMonths: BookingMonth[] = null;

  public webScanAvailable = false;

  private isAlertShowing = false;
  private isBookingShowing = false;
  private isFindBookingProcessing = false;

  constructor(public modalCtrl: ModalController,
    public events: Events,
    private barcodeScanner: BarcodeScanner,
    public platform: Platform) {
    super();
  }

  public async ngOnInit() {
    await super.ngOnInit();

    /*Set default country*/
    this.selectedCountry = this.session.country.country_code;

    /*Network event*/
    this.events.networkChange.subscribe(async (online) => {
      await super.ngOnInit();
      if (online) {
        await this.hideToastMsg();
        if (!this.dashboard) {
          this.loadDashboardView();
        }
      }
    });

    /*Country Changed event*/
    this.events.countryChange.subscribe(async (changed) => {
      await super.ngOnInit();
      if (changed) {
        this.loadDashboardView();
      } else {
        /*Set default country*/
        this.selectedCountry = this.session.country.country_code;
      }
    });

    /*Trips updated event*/
    this.events.tripsUpdated.subscribe(async (updated) => {
      await super.ngOnInit();
      if (updated) {
        this.loadDashboardView();
      }
    });

    /*Bookings updated event*/
    this.events.bookingsUpdated.subscribe(async (updated) => {
      await super.ngOnInit();
      if (updated) {
        this.loadDashboardView();
      }
    });

    /*Check if web scanning available */
    if (!this.platform.is('cordova')) {
      this.checkMediaDevice((available) => {
        if (available) {
          /*Web scanner event*/
          this.events.webScannerResult.subscribe(async (code) => {
            this.referenceCode = code;
            this.findBooking();
          });
        }
      });
    }
  }

  public async ionViewDidEnter() {
    super.ionViewDidEnter();

    /*Give time for components to load first*/
    if (!this.dashboard) {
      this.setTimeout(500).then(() => {
        /*Init Dashboard*/
        this.loadDashboardView(true);
      });
    }

    /*Refresh dashboard periodically*/
    this.setInterval(() => {
      this.loadDashboardView(false);
    }, ENVIRONMENT == ENV.PROD ? 5000 : 10000);
  }

  public async ionViewWillEnter() {
    /*Reload dashboard*/
    if (this.dashboard) {
      this.initDashboard();
    }
  }

  /**Check if Media Device is available */
  private checkMediaDevice(callback: (available: boolean) => any) {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      let checking = ["videoinput"];
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          this.webScanAvailable = devices.some(device => checking.includes(device.kind));
          callback(this.webScanAvailable);
        })
        .catch(() => {
          this.webScanAvailable = false;
          callback(this.webScanAvailable);
        });
    }
    else {
      this.webScanAvailable = true;
      callback(this.webScanAvailable);
    }
  }

  /** Set up dashboard contents
   * @return {Promise<void>}
   */
  public async initDashboard(): Promise<void> {

    if (this.dashboard) {

      // Set up status alerts
      if (this.dashboard.alert && this.dashboard.alert.status) {
        let toastType: ToastType = ToastType.NORMAL;
        let duration = 0;
        switch (this.dashboard.alert.type) {
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
        if (!this.isAlertShowing) {
          this.isAlertShowing = true;
          await this.showToastMsg(
            this.dashboard.alert.desc,
            toastType,
            duration, true,
            Utils.convertHTMLEntity("&times;"),
            () => {
              this.isAlertShowing = false
            });
        }
      }

      // Set up booking months
      this.bookingMonths = [];
      this.bookingMonths.push({
        min_date: "",
        max_date: "",
        display_date: this.strings.getString('all_months_txt'),
      });
      if (this.dashboard.booking_months && this.dashboard.booking_months.length > 0) {
        this.dashboard.booking_months.forEach((month: BookingMonth) => {
          this.bookingMonths.push(month)
        });
      }
      else {
        this.selectedBookingMonth = 0;
      }

      // Set up Charts
      this.setTimeout(800).then(() => {

        // Active Trips charts
        if (this.dashboard.active_trips) {
          this.dashboard.active_trips.forEach((trip: TripInfo) => {
            let element = (<any>document.getElementById('seatCanvas' + trip.trip_id));
            if (element) {
              new Chart(element.getContext('2d'), {
                type: 'pie',
                data: {
                  labels: [this.strings.getString("booked_txt"), this.strings.getString("locked_txt"), this.strings.getString("reserved_txt"), this.strings.getString("available_txt")],
                  datasets: [{
                    data: [parseInt(trip.booked_seats), parseInt(trip.locked_seats), parseInt(trip.reserved_seats), parseInt(trip.available_seats)],
                    backgroundColor: [
                      'rgb(46, 139, 87)',
                      'rgb(95, 95, 95)',
                      'rgba(223, 168, 48,1)',
                      'rgba(84, 142, 171,1)',
                    ],
                    hoverBackgroundColor: [
                      'rgb(35, 107, 67)',
                      'rgb(55, 55, 55)',
                      'rgb(155, 115, 40)',
                      "rgb(56, 89, 115)",
                    ]
                  }]
                }

              }).update();
            }

          });
        }

        // Bookings chart
        if (this.dashboard.bookings) {
          if (this.bookingCanvas) {
            new Chart(this.bookingCanvas.nativeElement.getContext('2d'), {
              type: 'doughnut',
              data: {
                labels: [
                  this.strings.getString("unpaid_txt"),
                  this.strings.getString("paid_txt"),
                  this.strings.getString("pending_txt"),
                  this.strings.getString("verified_txt"),
                  this.strings.getString("canceled_txt"),
                ],
                datasets: [{
                  data: [
                    this.dashboard.bookings.unpaid,
                    this.dashboard.bookings.paid,
                    this.dashboard.bookings.pending,
                    this.dashboard.bookings.verified,
                    this.dashboard.bookings.canceled,
                  ],
                  backgroundColor: [
                    'rgba(223, 99, 45,1)',
                    'rgba(84, 142, 171,1)',
                    'rgba(223, 168, 48,1)',
                    'rgb(46, 139, 87)',
                    'rgb(95, 95, 95)',
                  ],
                  hoverBackgroundColor: [
                    'rgb(155, 70, 32)',
                    "rgb(56, 89, 115)",
                    'rgb(155, 115, 40)',
                    'rgb(35, 107, 67)',
                    'rgb(55, 55, 55)',
                  ]
                }]
              }

            }).update()
          }
        }
      });
    }
  }

  /**Launch add trip page
   * @param {TripInfo} trip
   * @return {Promise<any>}
   */
  async showTrip(trip: TripInfo): Promise<any> {
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

  /**Launch view bookings
   * @param {Booking[]} bookings
   * @return {Promise<any>}
   */
  async showBookings(status: number, count: number): Promise<any> {
    if (count > 0) {
      let min_date = this.bookingMonths ? this.bookingMonths[this.selectedBookingMonth].min_date : "";
      let max_date = this.bookingMonths ? this.bookingMonths[this.selectedBookingMonth].max_date : "";
      return this.navigate('bookings', {
        status: status,
        min_date: min_date,
        max_date: max_date,
      });
    }
    else {
      return this.showToastMsg(Strings.getString("no_booking_txt"), ToastType.ERROR);
    }
  }

  /**Launch pay-in page
   * @param {PayInTransaction} payin
   * @return {Promise<any>}
   */
  async showPayIn(payin: PayInTransaction): Promise<any> {
    return this.navigate('pay-in', payin);
  }

  /**Launch payout page
   * @param {PayOutTransaction} payout
   * @return {Promise<any>}
   */
  async showPayout(payout: PayOutTransaction): Promise<any> {
    return this.navigate('payout', payout);
  }

  /**Launch scan Qr Code page
   */
  async showScanCode() {
    this.barcodeScanner.scan({
      resultDisplayDuration: 0,
      disableSuccessBeep: false,
      showTorchButton: true
    }).then(barcodeData => {
      if (Utils.assertAvailable(barcodeData.text)) {
        this.referenceCode = barcodeData.text;
        this.findBooking();
      }
    }).catch(e => {
      this.showToastMsg(e, ToastType.ERROR);
    });
  }

  /**Launch scan Qr Code for Web
   */
  async showWebScanCode() {
    return this.navigate('web-scanner');
  }

  /**Search input event
   * @param event
   * @param {boolean} isSearch
   */
  public onInput(event, isSearch: boolean = false) {
    if (event.isTrusted) {
      if (event.target.value && isSearch && event.target.value.length > 6 && !this.isFindBookingProcessing) {
        this.referenceCode = String(event.target.value).toUpperCase().trim();
        this.findBooking();
      }
    }
  }

  /**Reset Search bar
   * @param event
   */
  public onClear(event) {
    if (event.isTrusted) {
      this.referenceCode = null;
    }
  }

  /**Refresh View
   * @param event
   */
  public refreshDashboardView(event?) {
    this.loadDashboardView(true, () => {
      if (event) {
        this.onClear(event);
        event.target.complete();
      }
    })
  }

  /**Get Status class for booking status
   * @param {string} status
   * @return {string}
   */
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


  /**Launch Booking details
   * @param {BookingInfo} bookingInfo
   * @return {Promise<any>}
   */
  async showBooking(bookingInfo: BookingInfo): Promise<any> {
    if (this.isBookingShowing) return;
    let chooseModal = await this.modalCtrl.create({
      component: ViewBookingPage,
      componentProps: {
        bookingInfo: bookingInfo
      }
    });
    chooseModal.onDidDismiss().then(() => {
      this.referenceCode = null;
      this.isBookingShowing = false;
      return this.loadDashboardView();
    });
    return await chooseModal.present().then(() => {
      this.isBookingShowing = true;
    });
  }

  /**
   * Search booking for reference number
   */
  private findBooking() {
    if (this.referenceCode && !this.isFindBookingProcessing) {
      this.isFindBookingProcessing = true;
      this.showLoading().then(() => {
        Api.getBookingInfo(this.referenceCode, (status, result) => {
          this.hideLoading();
          this.isFindBookingProcessing = false;
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
  }



  /**
   * Select Month
   */
  public async selectMonth() {
    this.showLoading().then(() => {
      this.loadDashboardView(false, () => {
        this.hideLoading();
      })
    })
  }

  /**Load Active Trips View
   * @param force boolean
   * @param completed {() => any}
   */
  private isDashboardLoading = false;
  public async loadDashboardView(force = false, completed?: () => any) {
    if (this.isDashboardLoading) {
      if (this.assertAvailable(completed)) completed();
      return;
    }

    let min_date = this.bookingMonths ? this.bookingMonths[this.selectedBookingMonth].min_date : "";
    let max_date = this.bookingMonths ? this.bookingMonths[this.selectedBookingMonth].max_date : "";
    this.isDashboardLoading = true;
    Api.getDashboard(min_date, max_date, async (status, result) => {
      this.isDashboardLoading = false;
      if (status) { //Save user data to session
        if (this.assertAvailable(result)) {
          if (force || (result.data && (String(MD5(Utils.toJson(this.dashboard))) != String(MD5(Utils.toJson(result.data)))))) {
            this.dashboard = result.data;
            await this.initDashboard();
          }
        }
        else if (force) await this.showToastMsg(Strings.getString("error_unexpected"), ToastType.ERROR);
      }
      else if (force) await this.showToastMsg(result, ToastType.ERROR);
      if (this.assertAvailable(completed)) completed();
    });
  }
}
