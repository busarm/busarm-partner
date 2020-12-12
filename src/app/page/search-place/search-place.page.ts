import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {PageController} from "../page-controller";
import {ModalController, NavParams} from "@ionic/angular";
import {Utils} from "../../libs/Utils";
import {Country} from "../../models/ApiResponse";

declare var google: any;

@Component({
    selector: 'app-search-place',
    templateUrl: './search-place.page.html',
    styleUrls: ['./search-place.page.scss'],
})

export class SearchPlacePage extends PageController {

    @Input() title: string;
    @Input() country: Country;

    @ViewChild('mapRef') mapElement: ElementRef<HTMLDivElement>;

    public searchText: string = null;
    public googleAutoComplete = null;
    public autoCompleteItems = null;
    public selectedPlace = null;

    geocoder = null;
    map = null;
    marker:any = false;
    bounds = null;
    isLoading = false;

    constructor(private modalCtrl: ModalController,
                public navParams: NavParams) {
        super();
    }

    public async ngOnInit() {
        await super.ngOnInit();
        if (typeof google !== 'undefined') {
            this.googleAutoComplete = new google.maps.places.AutocompleteService();
            this.geocoder = new google.maps.Geocoder();
            this.initMap();
        }
        else {
            //Load Google Api
            if (this.session && this.session.configs && this.session.configs.google_api_key){
                Utils.loadGoogleApi(this.session.configs.google_api_key, () => {   
                    this.googleAutoComplete = new google.maps.places.AutocompleteService();
                    this.geocoder = new google.maps.Geocoder();
                    this.initMap();
                });
            }
        }
    }
    public ionViewDidEnter(){}

    /**Initialize Map*/
    private initMap() {

        this.bounds = new google.maps.LatLng(parseFloat(this.country.lat), parseFloat(this.country.lng));
        this.map = new google.maps.Map(this.mapElement.nativeElement, {center: this.bounds, zoom: 7});


        //Listen for any clicks on the map.
        google.maps.event.addListener(this.map, 'click', (event) => {

            //Get the location that the user clicked.
            let clickedLocation = event.latLng;

            //If the marker hasn't been added.
            if (this.marker === false) {

                //Create the marker.
               this.marker = new google.maps.Marker({
                    position: clickedLocation,
                    map: this.map,
                    draggable: true //make it draggable
                });

                //Listen for drag events!
                google.maps.event.addListener(this.marker, 'dragend', (event) => {
                    this.searchPlace(this.marker.getPosition())
                });

            } else {

                //Marker has already been added, so just change its location.
                this.marker.setPosition(clickedLocation);
            }

            //Get the marker's location.
            this.searchPlace(this.marker.getPosition())
        });
    }

    /**Search input event
     * */
    public onInput(event) {
        if (event.isTrusted) {
            this.searchText = event.target.value;
            this.updateSearchResults(event);
        }
    }

    /**Reset Search bar*/
    public onClear(event) {
        if (event.isTrusted) {
            this.searchText = null;
            this.autoCompleteItems = null;
            this.map.setCenter(this.bounds);
            this.map.setZoom(7);
        }
    }

    /**Obtain place*/
    updateSearchResults(event) {
        if (!Utils.assertAvailable(this.searchText) || this.searchText.length < 2) {
            this.onClear(event);
            return;
        }

        // Create a new session token.
        let sessionToken = new google.maps.places.AutocompleteSessionToken();

        this.googleAutoComplete.getPlacePredictions({
            input: this.searchText,
            sessionToken: sessionToken,
            componentRestrictions: {
                country: this.country.country_code
            },
            types: [
                "geocode",
                "establishment"
            ]
        }, (predictions, status) => {
            this.autoCompleteItems = [];
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                if (Utils.assertAvailable(predictions)) {
                    predictions.forEach((prediction) => {
                        this.autoCompleteItems.push({
                            placeId: prediction.place_id,
                            name: prediction.structured_formatting.main_text,
                            formatted_address: prediction.structured_formatting.secondary_text
                        });
                    });
                }
            }
        });
    }


    /**Get Place Details*/
    getPlaceDetails(placeId: string) {
        if (!this.isLoading){
            this.isLoading = true;
            this.selectedPlace = null;
            this.searchText = null;
            this.autoCompleteItems = null;
            let service = new google.maps.places.PlacesService(this.map);
            service.getDetails({
                placeId: placeId,
                fields: [
                    'name',
                    'formatted_address',
                    'geometry',
                    'address_components',
                ]
            }, (place, status) => {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    this.selectedPlace = place;
                    this.map.setCenter(place.geometry.location);
                    this.map.setZoom(10);
                    if (this.marker === false) {
                        this.marker = new google.maps.Marker({
                            position: place.geometry.location,
                            map: this.map,
                            draggable: true //make it draggable
                        });
                        google.maps.event.addListener(this.marker, 'dragend', (event) => {
                            this.searchPlace(this.marker.getPosition())
                        });
                    } else {
                        this.marker.setPosition(place.geometry.location);
                    }
                }
                this.isLoading = false;
            });
        }

    }

    /**Get Place Details*/
    searchPlace(latLang){
        if (!this.isLoading){
            this.isLoading = true;
            this.selectedPlace = null;
            this.geocoder.geocode({
                location: latLang
            }, (results, status) => {
                this.isLoading = false;
                if (status == google.maps.GeocoderStatus.OK) {
                    this.getPlaceDetails(results[0].place_id);
                }
                else{
                    this.isLoading = false;
                }
            })
        }
    }

    /**Close Modal*/
    dismiss(){
        this.modalCtrl.dismiss(this.selectedPlace)
    }
}
