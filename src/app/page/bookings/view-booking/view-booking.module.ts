import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';

import {ViewBookingPage} from './view-booking.page';
import { ViewTripPage } from '../../trip/view-trip/view-trip.page';
import { ViewTripPageModule } from '../../trip/view-trip/view-trip.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ViewTripPageModule
    ],
    declarations: [ViewBookingPage],
    entryComponents: [
        ViewTripPage
    ]
})
export class ViewBookingPageModule {
}
