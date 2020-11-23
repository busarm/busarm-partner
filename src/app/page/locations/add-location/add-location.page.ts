import {Component, Input} from '@angular/core';
import {ModalController, NavParams, Platform} from "@ionic/angular";
import {Country, LocationRequest, LocationType} from "../../../models/ApiResponse";
import {PageController} from "../../page-controller";
import {SearchPlacePage} from "../../search-place/search-place.page";
import {ToastType, Utils} from "../../../libs/Utils";
import {Api} from "../../../libs/Api";
import {Strings} from "../../../resources";

declare var google: any;

@Component({
    selector: 'app-add-location',
    templateUrl: './add-location.page.html',
    styleUrls: ['./add-location.page.scss'],
})
export class AddLocationPage extends PageController {

    @Input() locationTypes: LocationType[];

    selectedLocation: LocationRequest;
    selectedLocationType: number;
    platform: Platform;

    constructor(private modalCtrl: ModalController,
                public navParams: NavParams,
                platform: Platform,
    ) {
        super();
        this.platform = platform;
    }

    public async ngOnInit() {
        await super.ngOnInit();

        //Load google api if not available
        if (typeof google === 'undefined') {
            if (this.session && this.session.configs && this.session.configs.google_api_key){
                Utils.loadGoogleApi(this.session.configs.google_api_key);
            }
        }
    }
    public ionViewDidEnter(){}

    /**Select place*/
    public async selectLocation(event) {
        if (event.isTrusted) {
            if (this.userInfo) {
                this.searchLocation(this.session.country, this.strings.getString('select_location_txt'), place => {
                    let location = this.processLocation(place);
                    if (this.userInfo.allow_international || (location.country_code == this.session.country.country_code || location.country == this.session.country.country_name)){
                        this.selectedLocation = location
                    }
                    else {
                        this.showToastMsg(Strings.getString("invalid_location"), ToastType.ERROR);
                    }
                });
            }
        }
    }

    /**Launch location selector*/
    async searchLocation(country: Country, title: string, callback: (place: any) => any) {
        let chooseModal = await this.modalCtrl.create({
            component: SearchPlacePage,
            componentProps: {
                title: title,
                country: country
            }
        });
        chooseModal.onDidDismiss().then(data => {
            if (data.data) {
                callback(data.data);
            }
        });
        return await chooseModal.present();
    }


    /**Submit form*/
    public submit() {
        this.selectedLocation.type = String(this.selectedLocationType);
        this.showLoading().then(() => {
            Api.addLocation( 
                this.selectedLocation, 
                (status, result) => {
                    if (status) {
                        this.hideLoading();
                        if (this.assertAvailable(result)) {
                            this.showToastMsg(result.msg, ToastType.SUCCESS);
                            this.dismiss(true);
                        }
                        else {
                            this.showToastMsg(Strings.getString("error_unexpected"), ToastType.ERROR);
                        }
                    }
                    else {
                        this.hideLoading();
                        this.showToastMsg(result, ToastType.ERROR);
                    }
                });
        });
    }

    /**Convert to string*/
    public toJson(data: any) {
        return Utils.toJson(data);
    }


    /**Load Selected LocationRequest*/
    private processLocation(place): LocationRequest {
        let location: LocationRequest = {
            name: place.name,
            address: place.formatted_address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
        };

        if (place.address_components != null && place.address_components.length > 0) {
            place.address_components.forEach(address => {
                if (address.types != null && address.types.length > 0) {
                    address.types.forEach(type => {
                        switch (type) {
                            case "country":
                                location.country = location.country ? location.country : address.long_name;
                                location.country_code = location.country_code ? location.country_code : address.short_name;
                                break;
                            case "administrative_area_level_1":
                                location.province = location.province ? location.province : address.long_name;
                                break;
                            case "locality":
                                location.city = location.city ? location.city : address.long_name;
                                break;
                        }
                    });
                }
            });
        }

        return location;
    }

    /**Close Modal*/
    async dismiss(success?: boolean) {
        const modal = await this.modalCtrl.getTop();
        if(modal)
            modal.dismiss(success);
    }
}
