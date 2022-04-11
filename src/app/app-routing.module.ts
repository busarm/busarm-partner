import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import { AuthGuard } from './services/guards/AuthGuard';

const rootRouts: Routes = [
    {path: '', redirectTo: 'login', pathMatch:'full'},
    {path: 'hooks/oauth/authorize', loadChildren: () => import('./page/hooks/oauth/authorize/authorize.module').then(module => module.AuthorizePageModule)},
    {path: 'login', loadChildren: () => import('./page/login/login.module').then(module => module.LoginPageModule), canActivate: [AuthGuard]},
    {path: 'home', loadChildren: () => import('./page/home/home.module').then(module => module.HomePageModule), canActivate: [AuthGuard]},
    {path: 'agents', loadChildren: () => import('./page/agents/agents.module').then(module => module.AgentsPageModule), canActivate: [AuthGuard]},
    {path: 'bookings', loadChildren: () => import('./page/bookings/bookings.module').then(module => module.BookingsPageModule), canActivate: [AuthGuard]},
    {path: 'pay-in', loadChildren: () => import('./page/pay-in/pay-in.module').then(module => module.PayInPageModule), canActivate: [AuthGuard]},
    {path: 'payout', loadChildren: () => import('./page/payout/payout.module').then(module => module.PayoutPageModule), canActivate: [AuthGuard]},
    {path: 'locations', loadChildren: () => import('./page/locations/locations.module').then(module => module.LocationsPageModule), canActivate: [AuthGuard]},
    {path: 'web-scanner', loadChildren: () => import('./page/dashboard/web-scanner/web-scanner.module').then(module => module.WebScannerPageModule), canActivate: [AuthGuard]},
];

@NgModule({
    imports: [
        RouterModule.forRoot(rootRouts),
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
