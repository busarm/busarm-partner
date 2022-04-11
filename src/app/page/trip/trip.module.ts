import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TripPage } from './trip.page';
import { ViewTripPage } from "./view-trip/view-trip.page";
import { AddTripPage } from "./add-trip/add-trip.page";
import { ViewTripPageModule } from "./view-trip/view-trip.module";
import { AddTripPageModule } from "./add-trip/add-trip.module";
import { LoaderModule } from '../../components/loader/loader.module';

@NgModule({
  imports: [
    LoaderModule,
    CommonModule,
    FormsModule,
    IonicModule,
    ViewTripPageModule,
    AddTripPageModule
  ],
  declarations: [TripPage],
  entryComponents: [
    ViewTripPage,
    AddTripPage
  ]
})
export class TripPageModule {
}
