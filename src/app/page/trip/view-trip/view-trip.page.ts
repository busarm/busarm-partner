import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { PageController } from "../../page-controller";
import { Location } from "../../../models/Location/Location";
import { BusType } from "../../../models/Bus/BusType";
import { Status } from "../../../models/Status";
import { Bus } from "../../../models/Bus/Bus";
import { TicketType } from "../../../models/Ticket/TicketType";
import { Ticket } from "../../../models/Ticket/Ticket";
import { SeatStatus, TripSeat } from "../../../models/Trip/TripSeat";
import { Trip } from "../../../models/Trip/Trip";
import { IonToggle, ModalController } from "@ionic/angular";
import { ToastType, Utils } from "../../../helpers/Utils";
import { Api } from "../../../helpers/Api";
import { Strings } from "../../../resources";
import { AddTicketPage } from "../add-ticket/add-ticket.page";
import { AddBusPage } from "../../bus/add-bus/add-bus.page";
import { ViewBusPage } from "../../bus/view-bus/view-bus.page";
import { SelectStatusPage } from "./select-status/select-status.page";
import { AddTripPage } from "../add-trip/add-trip.page";
import { Chart } from "chart.js";
import { Subject } from "rxjs";

@Component({
  selector: "app-view-trip",
  templateUrl: "./view-trip.page.html",
  styleUrls: ["./view-trip.page.scss"],
})
export class ViewTripPage extends PageController {
  @ViewChild("seatCanvas") seatCanvas: ElementRef<HTMLCanvasElement>;
  @Input() trip: Trip = null;

  seatStatus = SeatStatus;

  statusList: Status[] = null;
  busTypes: BusType[] = null;
  ticketTypes: TicketType[] = null;
  buses: Bus[] = null;

  selectedBusType: string = null;
  allowAddTicket: boolean = true;
  allowDeactivateTicket: boolean = false;

  public readonly updated = new Subject<string>();

  constructor(private modalCtrl: ModalController) {
    super();
  }

  public async ngOnInit() {
    await super.ngOnInit();

    /*Trips updated event*/
    this.subscriptions.add(
      this.updated.asObservable().subscribe(async (id) => {
        await super.ngOnInit();
        if (this.trip && (!id || this.trip.trip_id === id)) {
          this.loadTripView(true);
        }
      })
    );
  }

  public ngOnDestroy() {
    this.trip = null;
    this.buses = null;
    super.ngOnDestroy();
  }

  public ionViewDidEnter() {
    if (this.assertAvailable(this.trip)) {
      this.loadTripView(false);
    } else {
      this.showToastMsg(
        this.strings.getString("error_unexpected"),
        ToastType.ERROR
      );
      this.dismiss();
    }
  }

  /**Load Trip View*/
  public async loadTripView(refresh: boolean = true, completed?: () => any) {
    /*Get Trip status*/
    Api.getAllTripStatusList(({ status, result }) => {
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
          this.allowAddTicket =
            this.ticketTypes &&
            this.trip &&
            this.trip.tickets &&
            this.trip.tickets.length < this.ticketTypes.length;
        }
      }
    });

    if (refresh) {
      /*Get trips*/
      this.loadTrip(completed);
    } else {
      this.processTrip(this.trip, completed);
    }
  }

  /**Load Trip*/
  public async loadTrip(completed?: () => any) {
    Api.getTrip(this.trip.trip_id, ({ status, result, msg }) => {
      if (status) {
        if (this.assertAvailable(result)) {
          if (result.data) {
            this.processTrip(result.data, completed);
          }
        } else {
          this.dismiss();
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
    });
  }

  /**Process Trip*/
  public async processTrip(trip: Trip, completed?: () => any) {
    // Process trip info
    this.selectedBusType = trip.bus_type_id;
    this.allowAddTicket =
      this.ticketTypes &&
      trip.tickets &&
      trip.tickets.length < this.ticketTypes.length;
    this.allowDeactivateTicket = trip.tickets && trip.tickets.length > 1;
    if (this.allowDeactivateTicket) {
      trip.tickets.forEach((value: Ticket) => {
        value.is_active =
          value.is_active == "1" ||
          value.is_active == 1 ||
          value.is_active == true;
        value.allow_deactivate =
          value.allow_deactivate == "1" ||
          value.allow_deactivate == 1 ||
          value.allow_deactivate == true;
      });
    }
    this.trip = trip;

    // Get buses matching trip's bus type
    Api.getBusesForType(this.trip.bus_type_id, ({ status, result, msg }) => {
      if (status) {
        if (this.assertAvailable(result)) {
          this.buses = result.data;
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

    // Set up chart
    this.setUpSeatChart();

    if (this.assertAvailable(completed)) {
      completed();
    }
  }

  /**
   * Set up bus seats chart
   */
  private setUpSeatChart() {
    if (this.seatCanvas) {
      new Chart(this.seatCanvas.nativeElement.getContext("2d"), {
        type: "pie",
        data: {
          labels: [
            this.strings.getString("booked_txt"),
            this.strings.getString("locked_txt"),
            this.strings.getString("reserved_txt"),
            this.strings.getString("available_txt"),
          ],
          datasets: [
            {
              data: [
                parseInt(this.trip.booked_seats),
                parseInt(this.trip.locked_seats),
                parseInt(this.trip.reserved_seats),
                parseInt(this.trip.available_seats),
              ],
              backgroundColor: [
                "rgb(46, 139, 87)",
                "rgb(95, 95, 95)",
                "rgba(223, 168, 48,1)",
                "rgba(84, 142, 171,1)",
              ],
              hoverBackgroundColor: [
                "rgb(35, 107, 67)",
                "rgb(55, 55, 55)",
                "rgb(155, 115, 40)",
                "rgb(56, 89, 115)",
              ],
            },
          ],
        },
      }).update();
    }
  }

  /**Launch agent
   * @param {string} agent_id
   */
  async showAgent(agent_id: string) {
    this.navigate("agents", { agent_id });
    this.dismiss();
  }

  /**Launch Select view*/
  async showSelectStatus() {
    let chooseModal = await this.modalCtrl.create({
      component: SelectStatusPage,
      componentProps: {
        statusList: this.statusList,
      },
    });
    chooseModal.onDidDismiss().then((data) => {
      if (data.data) {
        this.processSelectStatus(data.data);
      }
    });

    return await chooseModal.present();
  }

  /**Process Select status*/
  private processSelectStatus(status: Status) {
    // Show Loader
    this.showLoading().then(() => {
      Api.updateTripStatus(
        this.trip.trip_id,
        status.status_id,
        ({ status, result, msg }) => {
          this.hideLoading();
          if (status) {
            if (result.status) {
              this.updated.next(this.trip.trip_id);
              this.events.tripsUpdated.next(this.trip.trip_id);
              this.showToastMsg(result.msg, ToastType.SUCCESS);
            } else {
              this.showToastMsg(result.msg, ToastType.ERROR);
            }
          } else {
            this.showToastMsg(msg, ToastType.ERROR);
          }
        }
      );
    });
  }

  /**Launch Add ticket view*/
  async showAddTicket() {
    let country = this.session.country;
    let chooseModal = await this.modalCtrl.create({
      component: AddTicketPage,
      componentProps: {
        ticketTypes: this.ticketTypes,
        country: country,
      },
    });
    chooseModal.onDidDismiss().then((data) => {
      if (data.data) {
        this.processAddTicket(data.data);
      }
    });

    return await chooseModal.present();
  }

  /**Process Add bus*/
  private processAddTicket(ticket: Ticket) {
    //Add ticket id
    ticket.ticket_id = this.trip.ticket_id;

    //Show Loader
    this.showLoading().then(() => {
      Api.addTripTicket(ticket, ({ status, result, msg }) => {
        this.hideLoading();
        if (status) {
          if (result.status) {
            this.updated.next(this.trip.trip_id);
            this.events.tripsUpdated.next(this.trip.trip_id);
            this.showToastMsg(result.msg, ToastType.SUCCESS);
          } else {
            this.showToastMsg(result.msg, ToastType.ERROR);
          }
        } else {
          this.showToastMsg(msg, ToastType.ERROR);
        }
      });
    });
  }

  /**Launch add bus page*/
  async showAddBus() {
    let chooseModal = await this.modalCtrl.create({
      component: AddBusPage,
      componentProps: {
        busTypes: this.busTypes,
        buses: this.buses.filter((bus) => bus.available != "0"), // Only available buses
        selectedBusType: this.trip.bus_type_id,
      },
    });
    chooseModal.onDidDismiss().then((data) => {
      if (data.data) {
        this.processAddBus(data.data);
      }
    });
    return await chooseModal.present();
  }

  /**Process Add bus*/
  private processAddBus(bus: Bus) {
    //Show Loader
    this.showLoading().then(() => {
      Api.addTripBus(this.trip.trip_id, bus.id, ({ status, result, msg }) => {
        this.hideLoading();
        if (status) {
          if (result.status) {
            this.updated.next(this.trip.trip_id);
            this.events.tripsUpdated.next(this.trip.trip_id);
            this.events.busesUpdated.next(bus.id);
            this.showToastMsg(result.msg, ToastType.SUCCESS);
          } else {
            this.showToastMsg(result.msg, ToastType.ERROR);
          }
        } else {
          this.showToastMsg(msg, ToastType.ERROR);
        }
      });
    });
  }

  /**Launch view bus page*/
  async showBus(bus: Bus) {
    let chooseModal = await this.modalCtrl.create({
      component: ViewBusPage,
      componentProps: {
        bus: bus,
      },
    });
    chooseModal.onDidDismiss().then((data) => {
      if (data.data) {
        this.updated.next(this.trip.trip_id);
        this.events.tripsUpdated.next(this.trip.trip_id);
      }
    });
    return await chooseModal.present();
  }

  /**Update trip bus type*/
  public updateBusType() {
    this.showLoading().then(() => {
      Api.updateTripBusType(
        this.trip.trip_id,
        this.selectedBusType,
        ({ status, result, msg }) => {
          this.hideLoading();
          if (status) {
            if (result.status) {
              this.updated.next(this.trip.trip_id);
              this.events.tripsUpdated.next(this.trip.trip_id);
              this.showToastMsg(result.msg, ToastType.SUCCESS);
            } else {
              this.showToastMsg(result.msg, ToastType.ERROR);
            }
          } else {
            this.showToastMsg(msg, ToastType.ERROR);
          }
        }
      );
    });
  }

  /**Process Repeat Trip
   * */
  public async repeatTrip() {
    let pickup: Location = {
      loc_id: Utils.safeInt(this.trip.pickup_loc_id),
      loc_name: this.trip.pickup_loc_name,
      loc_address: this.trip.pickup_loc_address,
      city_id: Number(this.trip.pickup_city_id),
      city_name: this.trip.pickup_city,
      prov_code: this.trip.pickup_prov_code,
      prov_name: this.trip.pickup_prov_name,
    };
    let dropoff: Location = {
      loc_id: Utils.safeInt(this.trip.dropoff_loc_id),
      loc_name: this.trip.dropoff_loc_name,
      loc_address: this.trip.dropoff_loc_address,
      city_id: Number(this.trip.dropoff_city_id),
      city_name: this.trip.dropoff_city,
      prov_code: this.trip.dropoff_prov_code,
      prov_name: this.trip.dropoff_prov_name,
    };
    // Pass only Active and Upcomming status
    let status = this.statusList
      ? this.statusList.filter(
          (status) => status.status_id == "1" || status.status_id == "2"
        )
      : [];

    let chooseModal = await this.modalCtrl.create({
      component: AddTripPage,
      componentProps: {
        statusList: status,
        busTypes: this.busTypes,
        ticketTypes: this.ticketTypes,
        selectedPickup: pickup,
        selectedDropOff: dropoff,
        selectedBusType: this.trip.bus_type_id,
        selectedStatus: "2",
        selectedTickets: this.trip.tickets,
      },
    });
    chooseModal.onDidDismiss().then((data) => {
      if (data.data) {
        this.dismiss();
      }
    });
    return await chooseModal.present();
  }

  /**Show Delete confirmation
   * */
  public confirmDelete() {
    this.showAlert(
      this.strings.getString("delete_trip_title_txt"),
      this.strings.getString("delete_trip_msg_txt"),
      {
        title: this.strings.getString("no_txt"),
      },
      {
        title: this.strings.getString("yes_txt"),
        callback: () => {
          this.deleteTrip(this.trip.trip_id);
        },
      }
    );
  }

  /**Delete Trip*/
  public deleteTrip(tripId: string) {
    this.showLoading().then(() => {
      Api.deleteTrip(tripId, ({ status, result, msg }) => {
        this.hideLoading();
        if (status) {
          if (this.assertAvailable(result)) {
            if (result.status) {
              this.updated.next(this.trip.trip_id);
              this.events.tripsUpdated.next(this.trip.trip_id);
              this.showToastMsg(result.msg, ToastType.SUCCESS);
              this.dismiss();
            } else {
              this.showToastMsg(result.msg, ToastType.ERROR);
            }
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

  /**Toggle Trip Ticket*/
  public toggleTripTicket(event: CustomEvent<IonToggle>, ticket: Ticket) {
    if (ticket.is_active !== event.detail.checked) {
      ticket.is_active = event.detail.checked;
      this.showLoading().then(() => {
        Api.toggleTicket(
          ticket.ticket_id,
          ticket.type_id,
          ticket.is_active,
          ({ status, result, msg }) => {
            this.hideLoading();
            if (status) {
              if (this.assertAvailable(result)) {
                if (result.status) {
                  this.updated.next(this.trip.trip_id);
                  this.events.tripsUpdated.next(this.trip.trip_id);
                  this.showToastMsg(result.msg, ToastType.SUCCESS);
                } else {
                  ticket.is_active = !event.detail.checked;
                  this.showToastMsg(result.msg, ToastType.ERROR);
                }
              } else {
                ticket.is_active = !event.detail.checked;
                this.showToastMsg(
                  Strings.getString("error_unexpected"),
                  ToastType.ERROR
                );
              }
            } else {
              ticket.is_active = !event.detail.checked;
              this.showToastMsg(msg, ToastType.ERROR);
            }
          }
        );
      });
    }
  }

  /**Reseave trip seat*/
  public reserveTripSeat(event: CustomEvent<IonToggle>, seat: TripSeat) {
    if (
      (seat.status !== SeatStatus.RESERVED) !== event.detail.checked &&
      seat.status !== SeatStatus.BOOKED &&
      seat.status !== SeatStatus.LOCKED
    ) {
      seat.status = event.detail.checked
        ? SeatStatus.AVAILABLE
        : SeatStatus.RESERVED;
      this.showLoading().then(() => {
        Api.researveSeat(
          seat.trip_id,
          seat.seat_id,
          seat.status === SeatStatus.RESERVED,
          ({ status, result, msg }) => {
            this.hideLoading();
            if (status) {
              if (this.assertAvailable(result)) {
                if (result.status) {
                  this.updated.next(this.trip.trip_id);
                  this.events.tripsUpdated.next(this.trip.trip_id);
                  this.showToastMsg(result.msg, ToastType.SUCCESS);
                } else {
                  seat.status =
                    seat.status === SeatStatus.RESERVED
                      ? SeatStatus.AVAILABLE
                      : SeatStatus.RESERVED;
                  this.showToastMsg(result.msg, ToastType.ERROR);
                }
              } else {
                seat.status =
                  seat.status === SeatStatus.RESERVED
                    ? SeatStatus.AVAILABLE
                    : SeatStatus.RESERVED;
                this.showToastMsg(
                  Strings.getString("error_unexpected"),
                  ToastType.ERROR
                );
              }
            } else {
              seat.status =
                seat.status === SeatStatus.RESERVED
                  ? SeatStatus.AVAILABLE
                  : SeatStatus.RESERVED;
              this.showToastMsg(msg, ToastType.ERROR);
            }
          }
        );
      });
    }
  }

  /**Show Delete confirmation
   * */
  public confirmDeleteBus(bus: Bus) {
    this.showAlert(
      this.strings.getString("delete_bus_title_txt"),
      this.strings.getString("delete_bus_msg_txt"),
      {
        title: this.strings.getString("no_txt"),
      },
      {
        title: this.strings.getString("yes_txt"),
        callback: () => {
          this.deleteTripBus(this.trip.trip_id, bus.id);
        },
      }
    );
  }

  /**Delete Trip Bus*/
  public deleteTripBus(tripId: string, busId: string) {
    this.showLoading().then(() => {
      Api.deleteTripBus(tripId, busId, ({ status, result, msg }) => {
        this.hideLoading();
        if (status) {
          if (this.assertAvailable(result)) {
            if (result.status) {
              this.updated.next(this.trip.trip_id);
              this.events.tripsUpdated.next(this.trip.trip_id);
              this.events.busesUpdated.next(busId);
              this.showToastMsg(result.msg, ToastType.SUCCESS);
            } else {
              this.showToastMsg(result.msg, ToastType.ERROR);
            }
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

  /**Chek if trip is still open*/
  public checkIsOpen(status: string): boolean {
    if (this.assertAvailable(status)) {
      switch (status) {
        case "3":
        case "7":
        case "8":
          return false;
        default:
          return true;
      }
    }
  }

  /**Get Status class for trip seat status*/
  public getTripSeatStatusClass(status: SeatStatus): string {
    if (this.assertAvailable(status)) {
      switch (status) {
        case SeatStatus.BOOKED:
          return "status-ok";
        case SeatStatus.LOCKED:
          return "status-cancel";
        case SeatStatus.RESERVED:
          return "status-warn";
        case SeatStatus.AVAILABLE:
        default:
          return "status-default";
      }
    }
  }

  /**Get Status text for trip seat status*/
  public getTripSeatStatusText(status: SeatStatus): string {
    if (this.assertAvailable(status)) {
      switch (status) {
        case SeatStatus.BOOKED:
          return this.strings.getString("booked_txt");
        case SeatStatus.LOCKED:
          return this.strings.getString("locked_txt");
        case SeatStatus.RESERVED:
          return this.strings.getString("reserved_txt");
        case SeatStatus.AVAILABLE:
        default:
          return this.strings.getString("available_txt");
      }
    }
  }

  async dismiss() {
    const modal = await this.modalCtrl.getTop();
    if (modal) modal.dismiss();
  }
}
