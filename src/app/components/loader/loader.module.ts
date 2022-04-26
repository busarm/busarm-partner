import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';

import { LoaderComponent } from './loader.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
    imports: [
        IonicModule,
        FontAwesomeModule
    ],
    declarations: [LoaderComponent],
    exports: [LoaderComponent],
})
export class LoaderModule {
}
