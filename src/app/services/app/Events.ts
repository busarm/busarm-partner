import { EventEmitter, Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class Events {
  public readonly logoutTriggered = new Subject<boolean>();
  public readonly accessGranted = new Subject<boolean>();
  public readonly darkModeChanged = new Subject<boolean>();
  public readonly networkChanged = new Subject<boolean>();
  public readonly countryChanged = new Subject<boolean>();
  public readonly languageChanged = new Subject<boolean>();
  public readonly webScannerCompleted = new Subject<string>();

  public readonly tripsUpdated = new Subject<string>();
  public readonly busesUpdated = new Subject<string>();
  public readonly bookingsUpdated = new Subject<string>();
  public readonly userUpdated = new Subject<string>();
  public readonly locationUpdated = new Subject<string>();
}
