import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import {AccountPage} from './account.page';
import { UpdateAgentPageModule } from '../agents/update-agent/update-agent.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        UpdateAgentPageModule,
        FontAwesomeModule
    ],
    declarations: [AccountPage]
})
export class AccountPageModule {
}
