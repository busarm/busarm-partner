import {EventEmitter, Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class Events {
    public networkChange = new EventEmitter<boolean>();
    public countryChange = new EventEmitter<boolean>();
    public webScannerResult = new EventEmitter<string>();
}
