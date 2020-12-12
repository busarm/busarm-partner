import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {ViewTripPage} from './view-trip.page';

import {SelectStatusPage} from "./select-status/select-status.page";
import {SelectStatusPageModule} from "./select-status/select-status.module";

import { AddBusPageModule } from '../../bus/add-bus/add-bus.module';
import { AddBusPage } from '../../bus/add-bus/add-bus.page';
import { ViewBusPageModule } from '../../bus/view-bus/view-bus.module';
import { ViewBusPage } from '../../bus/view-bus/view-bus.page';
import { AddTicketPageModule } from '../add-ticket/add-ticket.module';
import { AddTicketPage } from '../add-ticket/add-ticket.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SelectStatusPageModule,
        AddTicketPageModule,
        AddBusPageModule,
        ViewBusPageModule
    ],
    declarations: [ViewTripPage],
    entryComponents: [
        SelectStatusPage,
        AddTicketPage,
        AddBusPage,
        ViewBusPage
    ]
})
export class ViewTripPageModule {
}
