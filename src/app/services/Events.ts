import {EventEmitter, Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class Events {
    public networkChange = new EventEmitter<boolean>();
    public countryChange = new EventEmitter<boolean>();
    public webScannerResult = new EventEmitter<string>();

    public tripsUpdated = new EventEmitter<boolean>();
    public busesUpdated = new EventEmitter<boolean>();
    public bookingsUpdated = new EventEmitter<boolean>();
}
