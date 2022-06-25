import {Component} from '@angular/core';
import {ModalController} from "@ionic/angular";
import { LocationsPage } from './locations.page';

@Component({
    selector: 'app-view-locations',
    templateUrl: './locations.page.html',
    styleUrls: ['./locations.page.scss'],
})
export class LocationsModal extends LocationsPage {
}
