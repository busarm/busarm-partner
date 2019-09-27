import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {BusPage} from './bus.page';
import {ViewBusPage} from "../view-bus/view-bus.page";
import {AddBusPage} from "../add-bus/add-bus.page";
import {ViewBusPageModule} from "../view-bus/view-bus.module";
import {AddBusPageModule} from "../add-bus/add-bus.module";

const routes: Routes = [
    {
        path: 'view-bus',
        component: ViewBusPage
    },
    {
        path: 'add-bus',
        component: AddBusPage
    },
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ViewBusPageModule,
        AddBusPageModule,
        RouterModule.forChild(routes)
    ],
    declarations: [BusPage]
})
export class BusPageModule {
}
