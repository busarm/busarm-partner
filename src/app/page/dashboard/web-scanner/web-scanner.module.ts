import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

import {WebScannerPage} from './web-scanner.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ZXingScannerModule
    ],
    declarations: [WebScannerPage]
})
export class WebScannerPageModule {
}
