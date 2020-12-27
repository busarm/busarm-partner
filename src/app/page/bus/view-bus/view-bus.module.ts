import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {ViewBusPage} from './view-bus.page';
import { ShareBusPageModule } from '../share-bus/share-bus.module';
import { ShareBusPage } from '../share-bus/share-bus.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ShareBusPageModule
    ],
    declarations: [ViewBusPage],
    entryComponents: [
        ShareBusPage
    ]
})
export class ViewBusPageModule {
}
