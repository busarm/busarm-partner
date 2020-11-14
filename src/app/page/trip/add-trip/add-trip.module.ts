import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {AddTripPage} from './add-trip.page';
import {SearchPlacePage} from "../../search-place/search-place.page";
import {SearchPlacePageModule} from "../../search-place/search-place.module";
import {AddTicketPageModule} from "../add-ticket/add-ticket.module";
import {AddTicketPage} from "../add-ticket/add-ticket.page";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SearchPlacePageModule,
        AddTicketPageModule
    ],
    declarations: [AddTripPage],
    entryComponents: [
        SearchPlacePage,
        AddTicketPage
    ]
})
export class AddTripPageModule {
}
