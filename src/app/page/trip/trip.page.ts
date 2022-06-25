import { Component } from "@angular/core";
import { AlertController, ModalController } from "@ionic/angular";
import { Network } from "@ionic-native/network/ngx";
import { Api } from "../../helpers/Api";
import { Strings } from "../../resources";
import { Utils } from "../../helpers/Utils";
import { ToastType } from "../../services/app/AlertService";
import { BusType } from "../../models/Bus/BusType";
import { Status } from "../../models/Status";
import { TicketType } from "../../models/Ticket/TicketType";
import { Trip } from "../../models/Trip/Trip";
import { PageController } from "../page-controller";
import { ViewTripPage } from "./view-trip/view-trip.page";
import { AddTripPage } from "./add-trip/add-trip.page";
import {
  DatePickerType,
  SelectDatePage,
} from "../../components/select-date/select-date.page";

type GroupedTrips = { date: string; list: Trip[] };
@Component({
  selector: "app-trip",
  templateUrl: "./trip.page.html",
  styleUrls: ["./trip.page.scss"],
})
export class TripPage extends PageController {
  // Current
  currentDate: Date = new Date();

  //Max Plus 1 month
  maxDate: Date = new Date(
    this.currentDate.getFullYear(),
    this.currentDate.getMonth() + 1
  );

  //Min - Max Minus 1 year
  minDate: Date = new Date(
    this.maxDate.getFullYear() - 1,
    this.maxDate.getMonth()
  );

  selectedDate: string = null;
  searchText: string = null;
  trips: Trip[] = null;
  currentTrips: GroupedTrips[] = null;
  statusList: Status[] = null;
  busTypes: BusType[] = null;
  ticketTypes: TicketType[] = null;

  constructor(
    public alertCtrl: AlertController,
    private modalCtrl: ModalController,
    public network: Network
  ) {
    super();
  }

  public async ngOnInit() {
    await super.ngOnInit();

    /*Network event*/
    this.subscriptions.add(
      this.events.networkChanged.asObservable().subscribe(async (online) => {
        await super.ngOnInit();
        if (online) {
          await this.hideToastMsg();
          if (!this.trips) {
            this.loadTripsView();
          }
        }
      })
    );

    /*Country Changed event*/
    this.subscriptions.add(
      this.events.countryChanged.asObservable().subscribe(async (changed) => {
        await super.ngOnInit();
        if (changed) {
          this.loadTripsView();
        } else {
          /*Set default country*/
          this.selectedCountry = this.session.country.country_code;
        }
      })
    );

    /*Trips updated event*/
    this.subscriptions.add(
      this.events.tripsUpdated.asObservable().subscribe(async (id) => {
        await super.ngOnInit();
        if (
          !this.trips ||
          this.trips.length == 0 ||
          (this.trips &&
            (!id || this.trips.some((trip) => trip.trip_id === id)))
        ) {
          this.loadTripsView();
        }
      })
    );

    /*Bus updated event*/
    this.subscriptions.add(
      this.events.busesUpdated.asObservable().subscribe(async (id) => {
        await super.ngOnInit();
        if (
          !this.trips ||
          this.trips.length == 0 ||
          (this.trips && (!id || this.trips.some((trip) => trip.bus_id === id)))
        ) {
          this.loadTripsView();
        }
      })
    );
  }

  public ngOnDestroy() {
    this.trips = null;
    super.ngOnDestroy();
  }

  public async ionViewDidEnter() {
    if (!this.trips) {
      this.selectedDate = this.selectedDate || this.currentDate.toString();
      this.loadTripsView();
    }
  }

  /**Search input event
   * */
  public onInput(event, isSearch?) {
    if (event.isTrusted) {
      this.searchText = event.target.value;
      if (this.assertAvailable(this.searchText) && this.searchText.length > 1) {
        if (this.assertAvailable(this.trips)) {
          this.filterTrips(this.searchText);
        }
      } else {
        this.onClear(event);
      }
    }
  }

  /**Filter
   * */
  public filterTrips(search: string) {
    if (search && this.assertAvailable(this.trips)) {
      let list: Trip[] = this.trips.filter((trip) => {
        let reg = new RegExp(search, "gi");
        return (
          trip.pickup_loc_name.match(reg) ||
          trip.pickup_city.match(reg) ||
          trip.dropoff_loc_name.match(reg) ||
          trip.dropoff_city.match(reg) ||
          trip.agent_email.match(reg) ||
          (trip.bus && trip.bus.plate_number.match(reg))
        );
      });
      this.currentTrips = this.groupTrips(list);
    }
  }

  /**Filter
   * */
  public groupTrips(trips: Trip[]): GroupedTrips[] {
    let list: GroupedTrips[] = [];
    for (let trip of trips) {
      let date = Utils.convertTZ(Utils.parseServerDate(trip.trip_date), this.session.country?.tz_text).toDateString();
      let match = list.find((t) => t.date === date);
      if (match) {
        let matchIndex = list.findIndex((t) => t.date === match.date);
        list[matchIndex].list.push(trip);
      } else {
        list.push({ date, list: [trip] });
      }
    }
    return list;
  }

  /**
   * Return Date string for date
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

  /**
   * Return Date string for selected date
   * */
  public getDisplayDateString() {
    return (
      Utils.beginningOfMonth(
        this.selectedDate,
        this.session?.country?.tz_text
      ).toDateString() +
      " " +
      this.strings.getString("to_txt").toLocaleLowerCase() +
      " " +
      Utils.endOfMonth(
        this.selectedDate,
        this.session?.country?.tz_text
      ).toDateString()
    );
  }

  /**Reset Search bar*/
  public onClear(event: any) {
    if (event.isTrusted) {
      this.searchText = null;
      this.currentTrips = this.groupTrips(this.trips);
    }
  }

  /**Launch select date model*/
  async showSelectDate() {
    let chooseModal = await this.modalCtrl.create({
      component: SelectDatePage,
      cssClass: "date-modal",
      componentProps: {
        date: this.selectedDate ? new Date(this.selectedDate) : new Date(),
        minDate: this.minDate,
        maxDate: this.maxDate,
        type: DatePickerType.MonthYear,
      },
      enterAnimation: (el: Element) => this.animation.modalZoomInEnterAnimation(el),
      leaveAnimation: (el: Element) => this.animation.modalZoomOutLeaveAnimation(el),
    });
    chooseModal.onDidDismiss().then((data) => {
      if (data.data && data.data !== NaN && data.data !== null) {
        this.selectedDate = data.data;
        this.loadTripsView();
      }
    });
    return await chooseModal.present();
  }

  /**Launch add trip page*/
  async showAddTrip() {
    let chooseModal = await this.modalCtrl.create({
      component: AddTripPage,
      componentProps: {
        statusList: this.statusList,
        busTypes: this.busTypes,
        ticketTypes: this.ticketTypes,
      },
    });
    chooseModal.onDidDismiss().then((data) => {
      if (data.data) {
        this.loadTripsView();
      }
    });
    return await chooseModal.present();
  }

  /**Launch view trip page*/
  async showTrip(trip: Trip) {
    let chooseModal = await this.modalCtrl.create({
      component: ViewTripPage,
      componentProps: {
        trip: trip,
      },
    });
    chooseModal.onDidDismiss().then((data) => {
      if (data.data) {
        this.loadTripsView();
      }
    });
    return await chooseModal.present();
  }

  /**Clear date*/
  public clearDate() {
    this.selectedDate = null;
  }

  /**Refresh View*/
  public refreshTripsView(event?) {
    this.loadTripsView(() => {
      if (event) {
        event.target.complete();
      }
    });
  }

  /**Load Trips View*/
  public loadTripsView(completed?: () => any) {
    /*Get Trip status*/
    Api.getNewTripStatusList(({ status, result }) => {
      if (status) {
        if (this.assertAvailable(result)) {
          this.statusList = result.data;
        }
      }
    });

    /*Get Bus Types*/
    Api.getPartnerBusTypes(({ status, result }) => {
      if (status) {
        if (this.assertAvailable(result)) {
          this.busTypes = result.data;
        }
      }
    });

    /*Get Ticket Types*/
    Api.getTicketTypes(({ status, result }) => {
      if (status) {
        if (this.assertAvailable(result)) {
          this.ticketTypes = result.data;
        }
      }
    });

    /*Get trips*/
    Api.getTrips(
      this.selectedDate
        ? this.getDateString(
          Utils.beginningOfMonth(
            this.selectedDate,
            this.session?.country?.tz_text
          )
        )
        : "",
      ({ status, result, msg }) => {
        if (status) {
          if (this.assertAvailable(result)) {
            this.searchText = null;
            this.trips = result.data;
            this.currentTrips = this.groupTrips(this.trips);
          } else {
            this.showToastMsg(
              Strings.getString("error_unexpected"),
              ToastType.ERROR
            );
          }
        } else {
          this.showToastMsg(msg, ToastType.ERROR);
        }

        if (this.assertAvailable(completed)) {
          completed();
        }
      }
    );
  }

  /**Get Status class for trip status*/
  public getTripStatusClass(status: string): string {
    if (this.assertAvailable(status)) {
      switch (status) {
        case "2":
        default:
          return "status-default";
        case "3":
          return "status-cancel";
        case "7":
          return "status-ok";
        case "8":
          return "status-warn";
      }
    }
  }
}
