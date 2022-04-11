import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchPlacePage } from './search-place.page';
import { LoaderModule } from '../../components/loader/loader.module';

@NgModule({
  imports: [
    LoaderModule,
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [SearchPlacePage]
})
export class SearchPlacePageModule {
}
