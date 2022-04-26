import { Injectable } from "@angular/core";
import { Network } from "@ionic-native/network/ngx";
import { HttpClient } from "@angular/common/http";
import { Urls } from "../../helpers/Urls";
import { Events } from "./Events";
import { SessionService } from "./SessionService";
import { PingResponse } from "../../models/PingResponse";

export enum ConnectionStatus {
  Unknown,
  Online,
  Offline,
}

@Injectable({
  providedIn: "root",
})
export class NetworkProvider {
  /**Get app instance*/
  public static get instance(): NetworkProvider {
    return NetworkProvider._instance;
  }
  private static _instance: NetworkProvider;

  private pingUrl: string = Urls.pingUrl;

  private previousStatus: ConnectionStatus = ConnectionStatus.Unknown;

  constructor(
    public network: Network,
    public event: Events,
    public httpClient: HttpClient,
    private sessionService: SessionService
  ) {
    NetworkProvider._instance = this;
  }

  /**Start connection check*/
  public async initializeNetworkEvents() {
    this.network
      ? this.network.onChange().subscribe(() => {
          return new Promise((resolve) => {
            this.pingServer((connected) => {
              this.notify(connected, false);
              resolve(connected);
            });
          });
        })
      : null;
  }

  /**Notify response*/
  public notify(connected: boolean, trigger: boolean = false): void {
    if (connected) {
      if (trigger && this.previousStatus != ConnectionStatus.Online) {
        this.event.networkChanged.next(true);
      }
      this.previousStatus = ConnectionStatus.Online;
    } else {
      if (trigger && this.previousStatus != ConnectionStatus.Offline) {
        this.event.networkChanged.next(false);
      }
      this.previousStatus = ConnectionStatus.Offline;
    }
  }

  /**Ping online server to check if connected*/
  public pingServer(callback: (connected: boolean) => any) {
    this.httpClient.get(this.pingUrl).subscribe(
      (data: PingResponse) => {
        this.sessionService.setPing(data);
        callback(true);
      },
      () => {
        callback(false);
      }
    );
  }

  /**Check if connection available*/
  public checkConnection(
    callback?: (connected: boolean) => any
  ): Promise<boolean> {
    /*Get Current network states*/
    return new Promise((resolve) => {
      NetworkProvider.instance.pingServer((connected) => {
        NetworkProvider.instance.notify(connected, false);
        if (callback) callback(connected);
        resolve(connected);
      });
    });
  }

  /**Check if connection available*/
  public static isOnline(): boolean {
    return NetworkProvider.instance.previousStatus === ConnectionStatus.Online;
  }
}
