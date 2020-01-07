import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {ViewTripPage} from './view-trip.page';

import {SelectStatusPage} from "./select-status/select-status.page";
import {SelectStatusPageModule} from "./select-status/select-status.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SelectStatusPageModule
    ],
    declarations: [ViewTripPage],
    entryComponents: [
        SelectStatusPage
    ]
})
export class ViewTripPageModule {
}
