import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {HomePage} from './home.page'; 
import { DashboardPage } from '../dashboard/dashboard.page';
import { TripPage } from '../trip/trip.page';
import { BusPage } from '../bus/bus.page';
import { AccountPage } from '../account/account.page'; 
import { DashboardPageModule } from '../dashboard/dashboard.module';
import { TripPageModule } from '../trip/trip.module';
import { BusPageModule } from '../bus/bus.module';
import { AccountPageModule } from '../account/account.module';
 
const routes: Routes = [ 
    {
        path: '',
        component: HomePage,
        children: [
            {
                path: 'dashboard',
                component:DashboardPage
            },
            {
                path: 'trip',
                component:TripPage
            },
            {
                path: 'bus',
                component:BusPage
            },
            {
                path: 'account',
                component:AccountPage
            },
            {
                path: '',
                redirectTo: '/home/dashboard',
                pathMatch: 'full'
            }
        ]
    }
];


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        DashboardPageModule,
        TripPageModule,
        BusPageModule,
        AccountPageModule,
        RouterModule.forChild(routes)
    ],
    declarations: [HomePage]
})
export class HomePageModule {
}
