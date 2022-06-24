import { Component, Input } from "@angular/core";
import { IonInput, ModalController, NavParams, Platform } from "@ionic/angular";
import { Location } from "../../../models/Location/Location";
import { BusType } from "../../../models/Bus/BusType";
import { Status } from "../../../models/Status";
import { TicketType } from "../../../models/Ticket/TicketType";
import { Ticket } from "../../../models/Ticket/Ticket";
import { Country } from "../../../models/Country";
import { DatePicker } from "@ionic-native/date-picker/ngx";
import { PageController } from "../../page-controller";
import { Utils } from "../../../helpers/Utils";
import { ToastType } from "../../../services/app/AlertService";
import { Api } from "../../../helpers/Api";
import { Strings } from "../../../resources";
import { LocationsModal } from "../../locations/locations.modal";
import { AddTicketPage } from "../add-ticket/add-ticket.page";
import {
  DatePickerType,
  SelectDatePage,
} from "../../../components/select-date/select-date.page";

declare var google: any;

@Component({
  selector: "app-add-trip",
  templateUrl: "./add-trip.page.html",
  styleUrls: ["./add-trip.page.scss"],
})
export class AddTripPage extends PageController {
  @Input() statusList: Status[];
  @Input() busTypes: BusType[];
  @Input() ticketTypes: TicketType[];

  // Optional
  @Input() selectedPickup: Location;
  @Input() selectedDropoff: Location;
  @Input() selectedBusType: number;
  @Input() selectedStatus: number;
  @Input() selectedTickets: Ticket[] = [];
  @Input() selectedPickupList: Location[] = [];
  @Input() selectedDropoffList: Location[] = [];

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
    platform: Platform
  ) {
    super();
    this.platform = platform;
  }

  public async ngOnInit() {
    await super.ngOnInit();
  }

  public ionViewDidEnter() {
    // Ensure selected pickup country matches current country
    let location = this.user?.default_location;
    if (
      location &&
      (location.country_code == this.session.country.country_code ||
        location.country_name == this.session.country.country_name)
    ) {
      this.selectedPickup = location;
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
        locale: this.user ? this.user.lang : "en",
      })
      .then(
        (date) => {
          this.selectedDateTime = date.toISOString();
        },
        (err) => console.log("Error occurred while getting date: ", err)
      );
  }

  /**Launch select date modal*/
  async showSelectDate() {
    let chooseModal = await this.modalCtrl.create({
      component: SelectDatePage,
      cssClass: "date-modal",
      componentProps: {
        date: this.selectedDateTime
          ? new Date(this.selectedDateTime)
          : new Date(),
        minDate: this.minDate,
        maxDate: this.maxDate,
        type: DatePickerType.DateTime,
      },
      enterAnimation: (el: Element) => this.animation.modalZoomInEnterAnimation(el),
      leaveAnimation: (el: Element) => this.animation.modalZoomOutLeaveAnimation(el),
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
  public async selectOrigin(event: CustomEvent<IonInput>) {
    if (event.isTrusted) {
      if (this.user) {
        this.selectLocation(
          this.strings.getString("select_pickup_txt"),
          null, null,
          this.session?.country?.country_code,
          (location: Location) => {
            if (
              // Origin location must always be from default country
              (location.country_code == this.session?.country?.country_code ||
                location.country_name == this.session?.country?.country_name) &&
              (!this.selectedDropoff ||
                location.loc_id != this.selectedDropoff.loc_id)
            ) {
              this.selectedPickup = location;
              this.selectedPickupList = [];
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
  public async selectDestination(event: CustomEvent<IonInput>) {
    if (event.isTrusted) {
      if (this.user) {
        this.selectLocation(
          this.strings.getString("select_dropoff_txt"),
          null, null, null,
          (location: Location) => {
            if (
              // Destination location can either be from default country or any of the supported countries
              ((this.session.configs.allow_international &&
                this.user.allow_international) ||
                location.country_code == this.session?.country?.country_code ||
                location.country_name == this.session?.country?.country_name) &&
              (!this.selectedPickup ||
                location.loc_id != this.selectedPickup.loc_id)
            ) {
              this.selectedDropoff = location;
              this.selectedDropoffList = [];
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
    if (this.user) {
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


  /**Select Pickup*/
  public async selectPickup() {
    if (this.selectedPickup) {
      this.selectLocation(
        this.strings.getString("select_pickup_txt"),
        String(this.selectedPickup?.city_id),
        String(this.selectedPickup?.prov_code),
        String(this.selectedPickup?.country_code),
        (location: Location) => {

          // Check if already exist
          if (this.selectedPickupList &&
            this.selectedPickupList.length > 0 &&
            this.selectedPickupList.some(loc => loc.loc_id == location.loc_id)) {
            return this.showToastMsg(
              Strings.getString("invalid_location"),
              ToastType.ERROR,
              5000
            );
          }

          // Check if matches default
          if (location.loc_id == this.selectedPickup?.loc_id) {
            return this.showToastMsg(
              Strings.getString("invalid_location_mactch_pickup"),
              ToastType.ERROR,
              5000
            );
          }

          // Add location
          this.selectedPickupList.push(location);
        }
      );
    }
  }

  /**Remove Pickup*/
  public removePickup(position: number) {
    if (this.selectedPickupList != null && this.selectedPickupList.length > 0) {
      this.selectedPickupList.splice(position, 1);
    }
  }

  /**Select Droppoff*/
  public async selectDropoff() {
    if (this.selectedDropoff) {
      this.selectLocation(
        this.strings.getString("select_pickup_txt"),
        String(this.selectedDropoff?.city_id),
        String(this.selectedDropoff?.prov_code),
        String(this.selectedDropoff?.country_code),
        (location: Location) => {

          // Check if already exist
          if (this.selectedDropoffList &&
            this.selectedDropoffList.length > 0 &&
            this.selectedDropoffList.some(loc => loc.loc_id == location.loc_id)) {
            return this.showToastMsg(
              Strings.getString("invalid_location"),
              ToastType.ERROR,
              5000
            );
          }

          // Check if matches default
          if (location.loc_id == this.selectedDropoff?.loc_id) {
            return this.showToastMsg(
              Strings.getString("invalid_location_mactch_dropoff"),
              ToastType.ERROR,
              5000
            );
          }

          // Add location
          this.selectedDropoffList.push(location);
        }
      );
    }
  }

  /**Remove Dropoff*/
  public removeDropoff(position: number) {
    if (this.selectedDropoffList != null && this.selectedDropoffList.length > 0) {
      this.selectedDropoffList.splice(position, 1);
    }
  }

  /**Launch location selector*/
  async selectLocation(
    title: string,
    city: string,
    province: string,
    country: string,
    callback: (place: any) => any
  ) {
    let chooseModal = await this.modalCtrl.create({
      component: LocationsModal,
      componentProps: {
        title: title,
        selector: true,
        country: country,
        province: province,
        city: city,
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
  async showAddTicket(country: Country, callback: (place: Ticket) => any) {
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
      Api.addTrip(
        Number(this.selectedPickup?.loc_id),
        Number(this.selectedDropoff?.loc_id),
        this.selectedDateTime
          ? new Date(this.selectedDateTime).toISOString()
          : null,
        this.selectedBusType,
        this.selectedStatus,
        this.selectedTickets,
        this.selectedPickupList.map((pickup) => Number(pickup.loc_id)),
        this.selectedDropoffList.map((pickup) => Number(pickup.loc_id)),
        ({ status, result, msg }) => {
          if (status) {
            this.hideLoading();
            if (this.assertAvailable(result)) {
              this.showToastMsg(result.msg, ToastType.SUCCESS);
              this.events.tripsUpdated.next();
              this.dismiss();
            } else {
              this.showToastMsg(
                Strings.getString("error_unexpected"),
                ToastType.ERROR
              );
            }
          } else {
            this.hideLoading();
            this.showToastMsg(msg, ToastType.ERROR);
          }
        }
      );
    });
  }

  /**Close Modal*/
  async dismiss() {
    const modal = await this.modalCtrl.getTop();
    if (modal) modal.dismiss();
  }
}
