import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {AddLocationPage} from './add-location.page';
import {SearchPlacePage} from "../../search-place/search-place.page";
import {SearchPlacePageModule} from "../../search-place/search-place.module";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SearchPlacePageModule
    ],
    declarations: [AddLocationPage],
    entryComponents: [
        SearchPlacePage
    ]
})
export class AddLocationPageModule {
}
