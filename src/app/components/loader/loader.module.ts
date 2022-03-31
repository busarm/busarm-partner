import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';

import { LoaderComponent } from './loader.component';

@NgModule({
    imports: [
        IonicModule
    ],
    declarations: [LoaderComponent],
    exports: [LoaderComponent],
})
export class LoaderModule {
}
