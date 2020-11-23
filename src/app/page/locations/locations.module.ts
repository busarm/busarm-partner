import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {LocationsPage} from './locations.page';
import { AddLocationPageModule } from './add-location/add-location.module';
import { AddLocationPage } from './add-location/add-location.page';

const routes: Routes = [ 
    {
        path: '',
        component: LocationsPage
    },
];
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AddLocationPageModule,
        RouterModule.forChild(routes)
    ],
    declarations: [LocationsPage],
    entryComponents: [
        AddLocationPage,
    ]
})

export class LocationsPageModule {
}
