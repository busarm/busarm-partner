import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import { LocationsPage } from './page/locations/locations.page';
import { AuthGuard } from './services/AuthGuard';

const rootRouts: Routes = [
    {path: '', redirectTo: 'login', pathMatch:'full'},
    {path: 'hooks/oauth/authorize', loadChildren: './page/hooks/oauth/authorize/authorize.module#AuthorizePageModule'},
    {path: 'login', loadChildren: './page/login/login.module#LoginPageModule', canActivate: [AuthGuard]},
    {path: 'home', loadChildren: './page/home/home.module#HomePageModule', canActivate: [AuthGuard]},
    {path: 'agents', loadChildren: './page/agents/agents.module#AgentsPageModule', canActivate: [AuthGuard]},
    {path: 'bookings', loadChildren: './page/bookings/bookings.module#BookingsPageModule', canActivate: [AuthGuard]},
    {path: 'pay-in', loadChildren: './page/pay-in/pay-in.module#PayInPageModule', canActivate: [AuthGuard]},
    {path: 'payout', loadChildren: './page/payout/payout.module#PayoutPageModule', canActivate: [AuthGuard]},
    {path: 'locations', loadChildren: './page/locations/locations.module#LocationsPageModule', canActivate: [AuthGuard]},
];

@NgModule({
    imports: [
        RouterModule.forRoot(rootRouts),
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}