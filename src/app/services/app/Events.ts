import { EventEmitter, Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class Events {
  public darkModeChange = new EventEmitter<boolean>(true);

  public networkChange = new EventEmitter<boolean>(true);
  public countryChange = new EventEmitter<boolean>(true);
  public webScannerResult = new EventEmitter<string>(true);

  public tripsUpdated = new EventEmitter<boolean>(true);
  public busesUpdated = new EventEmitter<boolean>(true);
  public bookingsUpdated = new EventEmitter<boolean>(true);
}
