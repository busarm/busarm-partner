import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {WebScannerPage} from './web-scanner.page';
import { ZXingScannerModule } from 'angular-weblineindia-qrcode-scanner';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ZXingScannerModule
    ],
    declarations: [WebScannerPage],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class WebScannerPageModule {
}
