import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {AddTripPage} from './add-trip.page';
import {AddTicketPageModule} from "../add-ticket/add-ticket.module";
import {AddTicketPage} from "../add-ticket/add-ticket.page";
import { LocationsPageModule } from '../../locations/locations.module';
import { LocationsPage } from '../../locations/locations.page';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AddTicketPageModule,
        LocationsPageModule
    ],
    declarations: [AddTripPage],
    entryComponents: [
        AddTicketPage,
        LocationsPage
    ]
})
export class AddTripPageModule {
}
