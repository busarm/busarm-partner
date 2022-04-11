import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPage } from './dashboard.page';
import { ViewBookingPage } from '../bookings/view-booking/view-booking.page';
import { ViewBookingPageModule } from '../bookings/view-booking/view-booking.module';
import { ViewTripPageModule } from '../trip/view-trip/view-trip.module';
import { ViewTripPage } from '../trip/view-trip/view-trip.page';
import { LoaderModule } from '../../components/loader/loader.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// import { WebScannerPage } from './web-scanner/web-scanner.page';
// import { WebScannerPageModule } from './web-scanner/web-scanner.module';


@NgModule({
  imports: [
    FontAwesomeModule,
    LoaderModule,
    CommonModule,
    FormsModule,
    IonicModule,
    ViewBookingPageModule,
    ViewTripPageModule,
    // WebScannerPageModule // If using it as a modal (Remove from app-routing tho)
  ],
  declarations: [DashboardPage],
  entryComponents: [
    ViewBookingPage,
    ViewTripPage,
    // WebScannerPage // If using it as a modal (Remove from app-routing tho)
  ]
})
export class DashboardPageModule {
}
