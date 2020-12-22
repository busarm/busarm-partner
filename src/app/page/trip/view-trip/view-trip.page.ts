import {Component, Input, OnInit} from '@angular/core';
import {PageController} from "../../page-controller";
import {BusInfo, BusType, Location, SeatsInfo, TicketInfo, TicketType, TripInfo, TripStatus} from "../../../models/ApiResponse";
import {ModalController} from "@ionic/angular";
import {ToastType, Utils} from "../../../libs/Utils";
import {Api} from "../../../libs/Api";
import {Strings} from "../../../resources";
import {AddTicketPage} from "../add-ticket/add-ticket.page";
import {AddBusPage} from "../../bus/add-bus/add-bus.page";
import {ViewBusPage} from "../../bus/view-bus/view-bus.page";
import {SelectStatusPage} from "./select-status/select-status.page";
import { AddTripPage } from '../add-trip/add-trip.page';

@Component({
    selector: 'app-view-trip',
    templateUrl: './view-trip.page.html',
    styleUrls: ['./view-trip.page.scss'],
})
export class ViewTripPage extends PageController {

    @Input() trip: TripInfo = null;

    statusList: TripStatus[] = null;
    busTypes: BusType[] = null;
    ticketTypes: TicketType[] = null;
    buses: BusInfo[] = null;

    selectedBusType:string = null;
    updated:boolean = false;
    allowAddTicket:boolean = true;
    allowDeactivateTicket:boolean = false;

    constructor(private modalCtrl: ModalController) {
        super();
    }

    public async ngOnInit() {
        await super.ngOnInit();
    }

    public ngOnDestroy(){
        this.trip = null;
        this.buses = null;
        super.ngOnDestroy();
    }

    public ionViewDidEnter(){
        if (this.assertAvailable(this.trip)) {
            this.loadTripView(false);
        }
        else {
            this.showToastMsg(this.strings.getString("error_unexpected"), ToastType.ERROR);
            this.modalCtrl.dismiss();
        }
    }

    /**Load Trip View*/
    public async loadTripView(refresh: boolean = true, completed?: () => any) {

        /*Get Trip status*/
        Api.getAllStatusList((status, result) => {
            if (status) {
                if (this.assertAvailable(result)) {
                    this.statusList = result.data;
                }
            }
        });

        /*Get Bus Types*/
        Api.getPartnerBusTypes((status, result) => {
            if (status) {
                if (this.assertAvailable(result)) {
                    this.busTypes = result.data;
                }
            }
        });

        /*Get Ticket Types*/
        Api.getTicketTypes((status, result) => {
            if (status) {
                if (this.assertAvailable(result)) {
                    this.ticketTypes = result.data;
                    this.allowAddTicket = this.ticketTypes && this.trip &&
                        this.trip.tickets && this.trip.tickets.length < this.ticketTypes.length;
                }
            }
        });

        if(refresh){
            /*Get trips*/
            this.loadTrip(completed);
        }
        else {
            this.processTrip(this.trip, completed);
        }
    }

    /**Load Trip*/
    public async loadTrip(completed?: () => any) {
        Api.getTrip(this.trip.trip_id, (status, result) => {
            if (status) {
                if (this.assertAvailable(result)) {
                    if (result.data) {
                        this.processTrip(result.data, completed);
                    }
                } else {
                    this.dismiss();
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
    
    /**Process Trip*/
    public async processTrip(trip: TripInfo, completed?: () => any) {

        this.selectedBusType = trip.bus_type_id;
        this.allowAddTicket = this.ticketTypes && trip.tickets &&
                                trip.tickets.length < this.ticketTypes.length;
        this.allowDeactivateTicket = trip.tickets && trip.tickets.length > 1;
        if (this.allowDeactivateTicket){
            trip.tickets.forEach((value: TicketInfo)=>{
                value.is_active = value.is_active == "1" || value.is_active == 1 || value.is_active == true;
                value.allow_deactivate = value.allow_deactivate == "1" || value.allow_deactivate == 1 ||
                                            value.allow_deactivate == true;
            });
        }
        this.trip = trip;
        
        /*Get buses matching trip's bus type*/
        Api.getBusesForType(this.trip.bus_type_id, (status, result) => {
            if (status) {
                if (this.assertAvailable(result)) {
                    this.buses = result.data;
                } else {
                    this.showToastMsg(Strings.getString("error_unexpected"), ToastType.ERROR);
                }
            } else {
                this.showToastMsg(result, ToastType.ERROR);
            }
        });

        if (this.assertAvailable(completed)) {
            completed();
        }
    }

    /**Launch Select view*/
    async showSelectStatus() {

        let chooseModal = await this.modalCtrl.create({
            component: SelectStatusPage,
            componentProps: {
                statusList: this.statusList,
            }
        });
        chooseModal.onDidDismiss().then(data => {
            if (data.data) {
                this.processSelectStatus(data.data);
            }
        });

        return await chooseModal.present();
    }

    /**Process Select status*/
    private processSelectStatus(status:TripStatus){

        // Show Loader
        this.showLoading().then(()=>{
            Api.updateTripStatus(this.trip.trip_id,status.status_id,(status, result) => {
                this.hideLoading();
                if (status){
                    if (result.status){
                        this.updated = true;
                        this.loadTripView();
                        this.showToastMsg(result.msg, ToastType.SUCCESS);
                    }
                    else{
                        this.showToastMsg(result.msg, ToastType.ERROR);
                    }
                }
                else{
                    this.showToastMsg(result, ToastType.ERROR);
                }
            })
        });
    }

    /**Launch Add ticket view*/
    async showAddTicket() {
        let country = this.session.country;
        let chooseModal = await this.modalCtrl.create({
            component: AddTicketPage,
            componentProps: {
                ticketTypes: this.ticketTypes,
                country: country
            }
        });
        chooseModal.onDidDismiss().then(data => {
            if (data.data) {
                this.processAddTicket(data.data);
            }
        });

        return await chooseModal.present();
    }

    /**Process Add bus*/
    private processAddTicket(ticket: TicketInfo){

        //Add ticket id
        ticket.ticket_id = this.trip.ticket_id;

        //Show Loader
        this.showLoading().then(()=>{
            Api.addTripTicket(ticket,(status, result) => {
                this.hideLoading();
                if (status){
                    if (result.status){
                        this.updated = true;
                        this.loadTripView();
                        this.showToastMsg(result.msg, ToastType.SUCCESS);
                    }
                    else{
                        this.showToastMsg(result.msg, ToastType.ERROR);
                    }
                }
                else{
                    this.showToastMsg(result, ToastType.ERROR);
                }
            })
        });
    }

    /**Launch add bus page*/
    async showAddBus() {
        let chooseModal = await this.modalCtrl.create({
            component: AddBusPage,
            componentProps: {
                busTypes: this.busTypes,
                buses: this.buses,
                selectedBusType:this.trip.bus_type_id
            }
        });
        chooseModal.onDidDismiss().then(data => {
            if (data.data) {
                this.processAddBus(data.data);
            }
        });
        return await chooseModal.present();
    }

    /**Process Add bus*/
    private processAddBus(bus:BusInfo){
        //Show Loader
        this.showLoading().then(()=>{
            Api.addTripBus(this.trip.trip_id, bus.id, (status, result) => {
                this.hideLoading();
                if (status){
                    if (result.status){
                        this.updated = true;
                        this.loadTripView();
                        this.showToastMsg(result.msg, ToastType.SUCCESS);
                    }
                    else {
                        this.showToastMsg(result.msg, ToastType.ERROR);
                    }
                }
                else{
                    this.showToastMsg(result, ToastType.ERROR);
                }
            });
        });
    }

    /**Launch view bus page*/
    async showBus(bus: BusInfo) {
        let chooseModal = await this.modalCtrl.create({
            component: ViewBusPage,
            componentProps: {
                bus: bus
            }
        });
        chooseModal.onDidDismiss().then(data => {
            if (data.data == true) {
                this.loadTripView();
            }
        });
        return await chooseModal.present();
    }

    /**Update trip bus type*/
    public updateBusType(){
        this.showLoading().then(()=>{
            Api.updateTripBusType(this.trip.trip_id, this.selectedBusType, (status, result) => {
                this.hideLoading();
                if (status){
                    if (result.status){
                        this.updated = true;
                        this.loadTripView();
                        this.showToastMsg(result.msg, ToastType.SUCCESS);
                    } else{
                        this.showToastMsg(result.msg, ToastType.ERROR);
                    }
                } else{
                    this.showToastMsg(result, ToastType.ERROR);
                }
            });
        });
    }

    
    /**Process Repeat Trip
     * */
    public async repeatTrip() {
        let pickup:Location = {
            loc_id: Utils.safeInt(this.trip.pickup_loc_id),
            loc_name: this.trip.pickup_loc_name, 
            
        }
        let dropoff:Location = {
            loc_id: Utils.safeInt(this.trip.dropoff_loc_id),
            loc_name: this.trip.dropoff_loc_name, 
        }
        // Pass only Active and Upcomming status
        let status = this.statusList ? this.statusList.filter(status => status.status_id == '1' || status.status_id == '2') : [];

        let chooseModal = await this.modalCtrl.create({
            component: AddTripPage,
            componentProps: {
                statusList: status,
                busTypes: this.busTypes,
                ticketTypes: this.ticketTypes,
                selectedPickup: pickup,
                selectedDropOff: dropoff,
                selectedBusType: this.trip.bus_type_id,
                selectedStatus: '2',
                selectedTickets: this.trip.tickets
            }
        });
        chooseModal.onDidDismiss().then(data => {
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
                title: this.strings.getString("no_txt")
            },
            {
                title: this.strings.getString("yes_txt"),
                callback: () => {
                    this.deleteTrip(this.trip.trip_id);
                }
            },
        );
    }

    /**Delete Trip*/
    public deleteTrip(tripId: string) {
        this.showLoading().then(()=>{
            Api.deleteTrip(tripId, (status, result) => {
                this.hideLoading();
                if (status) {
                    if (this.assertAvailable(result)) {
                        if (result.status){
                            this.updated = true;
                            this.showToastMsg(result.msg, ToastType.SUCCESS);
                            this.dismiss();
                        } else{
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

    /**Toggle Trip Ticket*/
    public toggleTripTicket(ticket: TicketInfo, toggle: boolean) {
        if(ticket.is_active !== toggle) {
            this.showLoading().then(()=>{
                Api.toggleTicket(ticket.ticket_id, ticket.type_id, toggle, (status, result) => {
                    this.hideLoading();
                    if (status) {
                        if (this.assertAvailable(result)) {
                            if (result.status){
                                this.updated = true;
                                this.showToastMsg(result.msg, ToastType.SUCCESS);
                            }
                            else{
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
                    //Reload trip
                    this.loadTrip();
                });
            });
        } 
    }
    
    /**Reseave trip seat*/
    public reserveTripSeat(seat: SeatsInfo, toggle: boolean) {
        if((seat.status=='reserved') !== toggle && seat.status!='booked' || seat.status!='locked') {
            this.showLoading().then(()=>{
                Api.researveSeat(seat.trip_id, seat.seat_id, !toggle, (status, result) => {
                    this.hideLoading();
                    if (status) {
                        if (this.assertAvailable(result)) {
                            if (result.status){
                                this.updated = true;
                                this.showToastMsg(result.msg, ToastType.SUCCESS);
                            }
                            else{
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
                    //Reload trip
                    this.loadTrip();
                });
            });
        } 
    }

    /**Show Delete confirmation
     * */
    public confirmDeleteBus(bus:BusInfo) {
        this.showAlert(
            this.strings.getString("delete_bus_title_txt"),
            this.strings.getString("delete_bus_msg_txt"),
            {
                title: this.strings.getString("no_txt")
            },
            {
                title: this.strings.getString("yes_txt"),
                callback: () => {
                    this.deleteTripBus(this.trip.trip_id,bus.id);
                }
            },
        );
    }

    /**Delete Trip Bus*/
    public deleteTripBus(tripId: string,busId: string) {
        this.showLoading().then(()=>{
            Api.deleteTripBus(tripId,busId, (status, result) => {
                this.hideLoading();
                if (status) {
                    if (this.assertAvailable(result)) {
                        if (result.status){
                            this.updated = true;
                            this.loadTripView();
                            this.showToastMsg(result.msg, ToastType.SUCCESS);
                        }
                        else{
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
    public getTripSeatStatusClass(status: string): string {
        if (this.assertAvailable(status)) {
            switch (status) {
                case "booked":
                    return "status-ok";
                case "locked":
                    return "status-cancel";
                case "reserved":
                    return "status-warn";
                case "available":
                default:
                    return "status-default";
            }
        }
    }


    /**Get Status text for trip seat status*/
    public getTripSeatStatusText(status: string): string {
        if (this.assertAvailable(status)) {
            switch (status) {
                case "booked":
                    return this.strings.getString('booked_txt');
                case "locked":
                    return this.strings.getString('locked_txt');
                case "reserved":
                    return this.strings.getString('reserved_txt');
                case "available":
                default:
                    return this.strings.getString('available_txt');
            }
        }
    }

    async dismiss(){
        const modal = await this.modalCtrl.getTop();
        if(modal)
            modal.dismiss(this.updated);
    }
}
