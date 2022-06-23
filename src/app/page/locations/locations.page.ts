import { Component, Input } from "@angular/core";
import { IonToggle, ModalController } from "@ionic/angular";
import { PageController } from "../page-controller";
import { LocationType } from "../../models/Location/LocationType";
import { Location } from "../../models/Location/Location";
import { Utils } from "../../helpers/Utils";
import { ToastType } from "../../services/app/AlertService";
import { Api } from "../../helpers/Api";
import { Strings } from "../../resources";
import { AddLocationPage } from "./add-location/add-location.page";
import { SessionService } from "../../services/app/SessionService";
import { Subject } from "rxjs";

@Component({
  selector: "app-view-locations",
  templateUrl: "./locations.page.html",
  styleUrls: ["./locations.page.scss"],
})
export class LocationsPage extends PageController {
  @Input() title: string;
  @Input() selector: boolean;
  @Input() city: string;
  @Input() province: string;
  @Input() country: string;

  searchText: string = null;
  locations: Location[] = null;
  currentLocations: Location[] = null;
  locationTypes: LocationType[] = null;

  public readonly updated = new Subject<string>();

  constructor(public modalCtrl: ModalController) {
    super();
  }

  public async ngOnInit() {
    await super.ngOnInit();

    /*Location updated event*/
    this.subscriptions.add(
      this.updated.asObservable().subscribe(async (id) => {
        await super.ngOnInit();
        if (
          !this.locations ||
          (this.locations &&
            (!id ||
              this.locations.some(
                (location) => String(location.loc_id) === id
              )))
        ) {
          this.loadLocationsView();
        }
      })
    );
  }

  public async ionViewDidEnter() {
    this.loadLocationsView();
  }

  /*Get Filterred Current Location */
  public filterCurrentLocations() {
    if (this.selector) {
      return this.currentLocations.filter(
        (x) =>
          x.is_active == true &&
          (!this.city || this.city === x.city_id) &&
          (!this.province || this.province === x.prov_code) &&
          (!this.country || this.country === x.country_code)
      );
    }
    return this.currentLocations;
  }

  /**Search input event
   * */
  public onInput(event, isSearch = false) {
    if (event.isTrusted) {
      this.searchText = event.target.value;
      if (this.assertAvailable(this.searchText) && this.searchText.length > 1) {
        if (this.assertAvailable(this.locations)) {
          this.currentLocations = [];
          for (let index in this.locations) {
            let location: Location = this.locations[index];
            let reg = new RegExp(this.searchText, "gi");
            if (
              location.loc_name.match(reg) ||
              location.city_name.match(reg) ||
              location.prov_name.match(reg)
            ) {
              this.currentLocations.push(location);
              this.currentLocations = this.filterCurrentLocations();
            }
          }
        }
      } else {
        this.onClear(event);
      }
    }
  }

  /**Reset Search bar*/
  public onClear(event) {
    if (event.isTrusted) {
      this.searchText = null;
      this.currentLocations = this.locations;
      this.currentLocations = this.filterCurrentLocations();
    }
  }

  /**Refresh View*/
  public refreshLocationsView(event) {
    this.loadLocationsView(() => {
      if (event) {
        event.target.complete();
      }
    });
  }

  /**Load Locations View*/
  public loadLocationsView(completed?: () => any) {
    /*Get Location Types*/
    Api.getLocationTypes(({ status, result }) => {
      if (status) {
        if (this.assertAvailable(result)) {
          this.locationTypes = result.data;
        }
      }
    });

    /*Get Locations*/
    Api.getLocations(({ status, result, msg }) => {
      if (status) {
        if (this.assertAvailable(result)) {
          this.locations = this.currentLocations = result.data;
          this.currentLocations = this.filterCurrentLocations();
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
    });
  }

  /**Launch add location page*/
  async showAddLocation() {
    let chooseModal = await this.modalCtrl.create({
      component: AddLocationPage,
      componentProps: {
        locationTypes: this.locationTypes,
      },
    });
    chooseModal.onDidDismiss().then((data) => {
      if (data.data) {
        this.updated.next();
        this.events.locationUpdated.next();
      }
    });
    return await chooseModal.present();
  }

  /**Show Delete confirmation
   * */
  public confirmDeleteLocation(location: Location) {
    this.showAlert(
      this.strings.getString("delete_location_title_txt"),
      this.strings.getString("delete_location_msg_txt"),
      {
        title: this.strings.getString("no_txt"),
      },
      {
        title: this.strings.getString("yes_txt"),
        callback: () => {
          this.deleteLocation(location);
        },
      }
    );
  }

  /**Delete Location*/
  public deleteLocation(location: Location) {
    this.showLoading().then(() => {
      Api.deleteLocation(Number(location.loc_id), ({ status, result, msg }) => {
        this.hideLoading();
        if (status) {
          if (this.assertAvailable(result)) {
            if (result.status) {
              this.updated.next(String(location.loc_id));
              this.events.locationUpdated.next(String(location.loc_id));
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

  /**Toggle Location active status*/
  public toggleLocation(event: CustomEvent<IonToggle>, location: Location) {
    if (location.is_active !== event.detail.checked) {
      location.is_active = event.detail.checked;
      this.showLoading().then(() => {
        Api.updateLocationActiveStatus(
          Number(location.loc_id),
          Boolean(location.is_active),
          ({ status, result, msg }) => {
            this.hideLoading();
            if (status) {
              if (this.assertAvailable(result)) {
                if (result.status) {
                  this.updated.next(String(location.loc_id));
                  this.events.locationUpdated.next(String(location.loc_id));
                  this.showToastMsg(result.msg, ToastType.SUCCESS);
                  if (location.is_default) {
                    this.refreshUser();
                  }
                } else {
                  location.is_active = !event.detail.checked;
                  this.showToastMsg(result.msg, ToastType.ERROR);
                }
              } else {
                location.is_active = !event.detail.checked;
                this.showToastMsg(
                  Strings.getString("error_unexpected"),
                  ToastType.ERROR
                );
              }
            } else {
              location.is_active = !event.detail.checked;
              this.showToastMsg(msg, ToastType.ERROR);
            }
          }
        );
      });
    }
  }

  /**Show confirmation
   * */
  public confirmMakeDefault(location: Location) {
    this.showAlert(
      this.strings.getString("make_default_txt"),
      this.strings.getString("make_default_msg_txt"),
      {
        title: this.strings.getString("no_txt"),
      },
      {
        title: this.strings.getString("yes_txt"),
        callback: () => {
          this.makeDefaultLocation(location);
        },
      }
    );
  }

  /**Toggle Location default state*/
  public makeDefaultLocation(location: Location) {
    if (!location.is_default) {
      this.showLoading().then(() => {
        Api.updateLocationdDefaultStatus(
          Number(location.loc_id),
          true,
          ({ status, result, msg }) => {
            this.hideLoading();
            if (status) {
              if (this.assertAvailable(result)) {
                if (result.status) {
                  this.showToastMsg(result.msg, ToastType.SUCCESS);
                  this.updated.next(String(location.loc_id));
                  this.events.locationUpdated.next(String(location.loc_id));
                  this.refreshUser();
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
          }
        );
      });
    }
  }

  /**Close Modal*/
  async dismiss(location?: Location) {
    const modal = await this.modalCtrl.getTop();
    if (modal)
      modal.dismiss(Utils.assertAvailable(location) ? location : false);
  }

  /**Refresh session user info*/
  public refreshUser() {
    Api.getUserInfo(({ status, result }) => {
      if (status) {
        if (Utils.assertAvailable(result)) {
          if (result.status) {
            // Save user data to session
            this.instance.sessionService.setUserInfo(result.data);
            this.user = result.data;
          }
        }
      }
    });
  }
}
