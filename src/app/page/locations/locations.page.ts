import { Component, Input } from '@angular/core';
import { ModalController } from "@ionic/angular";
import { PageController } from "../page-controller";
import { Location, LocationType } from "../../models/ApiResponse";
import { ToastType, Utils } from "../../helpers/Utils";
import { Api } from "../../helpers/Api";
import { Strings } from "../../resources";
import { AddLocationPage } from './add-location/add-location.page';
import { SessionManager } from '../../helpers/SessionManager';

@Component({
    selector: 'app-view-locations',
    templateUrl: './locations.page.html',
    styleUrls: ['./locations.page.scss'],
})
export class LocationsPage extends PageController {

    @Input() title: string;
    @Input() selector: boolean;

    searchText: string = null;
    locations: Location[] = null;
    currentLocations: Location[] = null;
    locationTypes: LocationType[] = null;

    constructor(public modalCtrl: ModalController) {
        super();
    }

    public async ngOnInit() {
        await super.ngOnInit();
    }

    public async ionViewDidEnter() {
        this.loadLocationsView();
    }

    /*Get Filterred Current Location */
    public filterCurrentLocations() {
        if (this.selector) {
            return this.currentLocations.filter(x => x.is_active == true);
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
                        let reg = new RegExp(this.searchText, 'gi');
                        if (location.loc_name.match(reg) || location.city_name.match(reg) || location.prov_name.match(reg)) {
                            this.currentLocations.push(location);
                            this.currentLocations = this.filterCurrentLocations();
                        }
                    }
                }
            }
            else {
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
    public refreshLocationsView(event?) {
        this.loadLocationsView(() => {
            if (event) {
                event.target.complete();
            }
        })
    }

    /**Load Locations View*/
    public loadLocationsView(completed?: () => any) {

        /*Get Location Types*/
        Api.getLocationTypes((status, result) => {
            if (status) {
                if (this.assertAvailable(result)) {
                    this.locationTypes = result.data;
                }
            }
        });

        /*Get Locations*/
        Api.getLocations((status, result) => {
            if (status) {
                if (this.assertAvailable(result)) {
                    this.locations = this.currentLocations = result.data;
                    this.currentLocations = this.filterCurrentLocations();
                } else {
                    this.showToastMsg(Strings.getString("error_unexpected"), ToastType.ERROR);
                }
            } else {
                this.showToastMsg(result, ToastType.ERROR);
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
            }
        });
        chooseModal.onDidDismiss().then(data => {
            if (data.data) {
                this.loadLocationsView();
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
                title: this.strings.getString("no_txt")
            },
            {
                title: this.strings.getString("yes_txt"),
                callback: () => {
                    this.deleteLocation(location);
                }
            },
        );
    }

    /**Delete Location*/
    public deleteLocation(location: Location) {
        this.showLoading().then(() => {
            Api.deleteLocation(location.loc_id, (status, result) => {
                this.hideLoading();
                if (status) {
                    if (this.assertAvailable(result)) {
                        if (result.status) {
                            this.loadLocationsView();
                            this.showToastMsg(result.msg, ToastType.SUCCESS);
                        } else {
                            this.showToastMsg(result.msg, ToastType.ERROR);
                        }
                    } else {
                        this.showToastMsg(Strings.getString("error_unexpected"), ToastType.ERROR);
                    }
                } else {
                    this.showToastMsg(result, ToastType.ERROR);
                }
            });
        });
    }

    /**Toggle Location active status*/
    public toggleLocation(location: Location, toggle: boolean) {
        if (location.is_active !== toggle) {
            this.showLoading().then(() => {
                Api.updateLocationActiveStatus(location.loc_id, toggle, (status, result) => {
                    this.hideLoading();
                    if (status) {
                        if (this.assertAvailable(result)) {
                            if (result.status) {
                                this.showToastMsg(result.msg, ToastType.SUCCESS);
                                if(location.is_default){
                                    this.refreshUser();
                                }
                            }
                            else {
                                this.showToastMsg(result.msg, ToastType.ERROR);
                            }
                        }
                        else {
                            this.showToastMsg(Strings.getString("error_unexpected"), ToastType.ERROR);
                        }
                    }
                    else {
                        this.showToastMsg(result, ToastType.ERROR);
                    }
                    this.loadLocationsView();
                });
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
                title: this.strings.getString("no_txt")
            },
            {
                title: this.strings.getString("yes_txt"),
                callback: () => {
                    this.makeDefaultLocation(location);
                }
            },
        );
    }

    /**Toggle Location default state*/
    public makeDefaultLocation(location: Location) {
        if (!location.is_default) {
            this.showLoading().then(() => {
                Api.updateLocationdDefaultStatus(location.loc_id, true, (status, result) => {
                    this.hideLoading();
                    if (status) {
                        if (this.assertAvailable(result)) {
                            if (result.status) {
                                this.showToastMsg(result.msg, ToastType.SUCCESS);
                                this.refreshUser();
                            }
                            else {
                                this.showToastMsg(result.msg, ToastType.ERROR);
                            }
                        }
                        else {
                            this.showToastMsg(Strings.getString("error_unexpected"), ToastType.ERROR);
                        }
                    }
                    else {
                        this.showToastMsg(result, ToastType.ERROR);
                    }
                    this.loadLocationsView();
                });
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
        Api.getUserInfo((status, result) => {
            if (status) {
                if (Utils.assertAvailable(result)) {
                    if (result.status) {
                        // Save user data to session
                        SessionManager.setUserInfo(result.data);
                        this.userInfo = result.data;
                    }
                }
            }
        });
    }
}
