import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BookingsPage } from "./bookings.page";
import { ViewBookingPage } from "./view-booking/view-booking.page";
import { ViewBookingPageModule } from "./view-booking/view-booking.module";
import { RouterModule, Routes } from "@angular/router";
import { LoaderModule } from '../../components/loader/loader.module';

const routes: Routes = [
  {
    path: '',
    component: BookingsPage
  }
];
@NgModule({
  imports: [
    LoaderModule,
    CommonModule,
    FormsModule,
    IonicModule,
    ViewBookingPageModule,
    RouterModule.forChild(routes)
  ],
  declarations: [BookingsPage],
  entryComponents: [
    ViewBookingPage
  ]
})
export class BookingsPageModule {
}
