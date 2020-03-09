import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';

import {ViewBookingPage} from './view-booking.page';
import { ViewTripPage } from '../../trip/view-trip/view-trip.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule
    ],
    declarations: [ViewBookingPage],
    entryComponents: [
        ViewTripPage
    ]
})
export class ViewBookingPageModule {
}
