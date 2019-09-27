import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {AgentsPage} from './agents.page';
import {AddAgentPage} from "../add-agent/add-agent.page";
import {AddAgentPageModule} from "../add-agent/add-agent.module";
import {RouterModule, Routes} from "@angular/router";

const routes: Routes = [
    {
        path: 'add-agent',
        component: AddAgentPage
    },
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AddAgentPageModule,
        RouterModule.forChild(routes)
    ],
    declarations: [AgentsPage]
})

export class AgentsPageModule {
}
