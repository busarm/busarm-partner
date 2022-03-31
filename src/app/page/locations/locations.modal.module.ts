import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LocationsModal } from './locations.modal';
import { AddLocationPageModule } from './add-location/add-location.module';
import { AddLocationPage } from './add-location/add-location.page';
import { LoaderModule } from '../../components/loader/loader.module';

@NgModule({
  imports: [
    LoaderModule,
    CommonModule,
    FormsModule,
    IonicModule,
    AddLocationPageModule,
  ],
  declarations: [LocationsModal],
  entryComponents: [
    AddLocationPage,
  ]
})

export class LocationsModalModule {
}
