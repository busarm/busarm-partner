import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {DashboardPage} from './dashboard.page';
import { ViewBookingPage } from '../bookings/view-booking/view-booking.page';
import { ViewBookingPageModule } from '../bookings/view-booking/view-booking.module';
import { ViewTripPageModule } from '../trip/view-trip/view-trip.module';
import { ViewTripPage } from '../trip/view-trip/view-trip.page';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ViewBookingPageModule,
        ViewTripPageModule
    ],
    declarations: [DashboardPage],
    entryComponents: [
        ViewBookingPage,
        ViewTripPage
    ]
})
export class DashboardPageModule {
}
