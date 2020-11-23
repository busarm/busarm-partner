import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {AddTripPage} from './add-trip.page';
import {AddTicketPageModule} from "../add-ticket/add-ticket.module";
import {AddTicketPage} from "../add-ticket/add-ticket.page";
import { LocationsModalModule } from '../../locations/locations.modal.module';
import { LocationsModal } from '../../locations/locations.modal';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AddTicketPageModule,
        LocationsModalModule
    ],
    declarations: [AddTripPage],
    entryComponents: [
        AddTicketPage,
        LocationsModal
    ]
})
export class AddTripPageModule {
}
