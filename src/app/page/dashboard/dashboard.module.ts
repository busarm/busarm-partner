import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {DashboardPage} from './dashboard.page';
import {PayInPage} from "../pay-in/pay-in.page";
import {PayInPageModule} from "../pay-in/pay-in.module";
import {PayoutPageModule} from "../payout/payout.module";
import {PayoutPage} from "../payout/payout.page";
import {BookingsPage} from "../bookings/bookings.page";
import {BookingsPageModule} from "../bookings/bookings.module";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        BookingsPageModule,
        PayInPageModule,
        PayoutPageModule
    ],
    declarations: [DashboardPage],
    entryComponents: [
        BookingsPage,
        PayInPage,
        PayoutPage
    ]
})
export class DashboardPageModule {
}
