import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class Events {

    private network = new Subject<boolean>();
    private CountryChange = new Subject<boolean>();

    publishNetworkEvent(online: boolean) {
        this.network.next(online);
    }

    getNetworkObservable(): Subject<boolean> {
        return this.network;
    }

    publishCountryChangeEvent(online: boolean) {
        this.CountryChange.next(online);
    }

    getCountryChangeObservable(): Subject<boolean> {
        return this.CountryChange;
    }
}
