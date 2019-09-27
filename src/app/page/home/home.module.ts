import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {HomePage} from './home.page';
import {DashboardPage} from "../dashboard/dashboard.page";
import {DashboardPageModule} from "../dashboard/dashboard.module";
import {TripPage} from "../trip/trip.page";
import {TripPageModule} from "../trip/trip.module";
import {BusPage} from "../bus/bus.page";
import {BusPageModule} from "../bus/bus.module";
import {AccountPage} from "../account/account.page";
import {AccountPageModule} from "../account/account.module";
import {AuthGuard} from "../../utils/AuthGuard";

const routes: Routes = [
    {
        path: 'home',
        component: HomePage,
        canActivate: [AuthGuard],
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
