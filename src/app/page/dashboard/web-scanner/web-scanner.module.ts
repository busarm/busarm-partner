import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

import {WebScannerPage} from './web-scanner.page';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [ 
    {
        path: '',
        component: WebScannerPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ZXingScannerModule,
        RouterModule.forChild(routes)
    ],
    declarations: [WebScannerPage]
})
export class WebScannerPageModule {
}
