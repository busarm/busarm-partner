import { Injectable } from "@angular/core";
import { Network } from "@ionic-native/network/ngx";
import { HttpClient } from "@angular/common/http";
import { Urls } from "../../helpers/Urls";
import { Events } from "./Events";
import { SessionService } from "./SessionService";
import { PingResponse } from "../../models/PingResponse";
import { Platform } from "@ionic/angular";

export enum ConnectionStatus {
  Unknown,
  Online,
  Offline,
}

@Injectable({
  providedIn: "root",
})
export class NetworkProvider {
  private intervalSeconds = 10;
  private lastCheckedDate: Date = null;

  /**Get app instance*/
  public static get instance(): NetworkProvider {
    return NetworkProvider._instance;
  }
  private static _instance: NetworkProvider;

  private pingUrl: string = Urls.pingUrl;

  private status: ConnectionStatus = ConnectionStatus.Unknown;

  constructor(
    public platform: Platform,
    public network: Network,
    public event: Events,
    public httpClient: HttpClient,
    private sessionService: SessionService
  ) {
    NetworkProvider._instance = this;
    // Initial connection check
    this.checkConnection();
  }

  /**Start connection check*/
  public initializeNetworkEvents() {
    // Android / IOS
    if (this.platform.is("cordova") && this.network) {
      this.network.onChange().subscribe((value) => {
        console.log("Network", value);
        this.lastCheckedDate = null;
        this.checkConnection(true);
      });
    }
    // Browser
    else if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        console.log("Network online");
        this.lastCheckedDate = null;
        this.checkConnection(true);
      });
      window.addEventListener("offline", () => {
        console.log("Network offline");
        this.notify(false);
      });
    }
  }

  /**
   * Notify response
   * @param {Boolean} connected
   * @param {Boolean} trigger
   */
  public notify(connected: boolean, trigger: boolean = false): void {
    if (connected) {
      if (trigger && this.status != ConnectionStatus.Online) {
        this.event.networkChanged.next(true);
      }
      this.status = ConnectionStatus.Online;
    } else {
      if (trigger && this.status != ConnectionStatus.Offline) {
        this.event.networkChanged.next(false);
      }
      this.status = ConnectionStatus.Offline;
    }
  }

  /**
   * Ping online server to check if connected
   * @returns {Promise<boolean>}
   */
  public ping(): Promise<boolean> {
    return new Promise((resolve) => {
      this.httpClient.get(this.pingUrl).subscribe(
        (data: PingResponse) => {
          this.sessionService.setPing(data);
          resolve(true);
        },
        () => {
          resolve(false);
        }
      );
    });
  }

  /**Check if connection available
   * @param {Boolean} trigger
   * @returns {Promise<boolean>}
   * */
  public checkConnection(trigger: boolean = false): Promise<boolean> {
    /*Get Current network states*/
    return new Promise((resolve) => {
      // If has not been checked in the given interval
      if (
        !this.lastCheckedDate ||
        this.lastCheckedDate.getTime() / 1000 + this.intervalSeconds <=
          new Date().getTime() / 1000
      ) {
        this.ping().then((connected) => {
          this.lastCheckedDate = new Date();
          this.notify(connected, trigger);
          resolve(connected);
        });
      } else resolve(this.isOnline());
    });
  }

  /**Check if connection available*/
  public isOnline(): boolean {
    return NetworkProvider.instance.status === ConnectionStatus.Online;
  }
}
