import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {AccountPage} from './account.page';
import {AgentsPage} from "../agents/agents.page";
import {AgentsPageModule} from "../agents/agents.module";
import {RouterModule, Routes} from "@angular/router";
import {AuthGuard} from "../../utils/AuthGuard";

const routes: Routes = [
    {
        path: 'agents',
        component: AgentsPage,
        canActivate: [AuthGuard]
    },
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AgentsPageModule,
        RouterModule.forChild(routes)
    ],
    declarations: [AccountPage]
})
export class AccountPageModule {
}
