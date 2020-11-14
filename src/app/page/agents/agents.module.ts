import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {AgentsPage} from './agents.page';
import {AddAgentPage} from "./add-agent/add-agent.page";
import {AddAgentPageModule} from "./add-agent/add-agent.module";

const routes: Routes = [ 
    {
        path: '',
        component: AgentsPage
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
    declarations: [AgentsPage],
    entryComponents: [
        AddAgentPage
    ]
})

export class AgentsPageModule {
}
