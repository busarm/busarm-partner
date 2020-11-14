import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {ViewTripPage} from './view-trip.page';

import {SelectStatusPage} from "./select-status/select-status.page";
import {SelectStatusPageModule} from "./select-status/select-status.module";

import {AddBusPageModule} from '../../bus/add-bus/add-bus.module';
import {AddBusPage} from '../../bus/add-bus/add-bus.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SelectStatusPageModule,
        AddBusPageModule
    ],
    declarations: [ViewTripPage],
    entryComponents: [
        SelectStatusPage,
        AddBusPage
    ]
})
export class ViewTripPageModule {
}
