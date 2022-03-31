import { Injectable } from "@angular/core";
import { Network } from "@ionic-native/network/ngx";
import { HttpClient } from "@angular/common/http";
import { Urls } from "../../helpers/Urls";
import { AppComponent } from "../../app.component";
import { Events } from "./Events";
import { SessionManager } from "../../helpers/SessionManager";
import { PingResponse } from "../../models/PingResponse";

export enum ConnectionStatus {
    Unknown,
    Online,
    Offline,
}

@Injectable({
  providedIn: 'root'
})
export class NetworkProvider {
    private pingUrl: string = Urls.pingUrl;

    private static previousStatus: ConnectionStatus = ConnectionStatus.Unknown;
    private static instance: NetworkProvider;

    constructor(
        public network: Network,
        public event: Events,
        public httpClient: HttpClient
    ) {
      NetworkProvider.instance = this;
    }

    /**Get Connection instance*/
    public static getInstance(): NetworkProvider {
        return this.instance;
    }

    /**Start connection check*/
    public async initializeNetworkEvents() {
        return this.network
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
    private notify(connected: boolean, trigger: boolean = false): void {
        if (connected) {
            if (
                trigger &&
                NetworkProvider.previousStatus != ConnectionStatus.Online
            ) {
                this.event.networkChange.emit(true);
            }
            NetworkProvider.previousStatus = ConnectionStatus.Online;
        } else {
            if (
                trigger &&
                NetworkProvider.previousStatus != ConnectionStatus.Offline
            ) {
                this.event.networkChange.emit(false);
            }
            NetworkProvider.previousStatus = ConnectionStatus.Offline;
        }
    }

    /**Ping online server to check if connected*/
    private pingServer(callback: (connected: boolean) => any) {
        this.httpClient.get(this.pingUrl).subscribe(
            (data: PingResponse) => {
                SessionManager.setPing(data);
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
            NetworkProvider.getInstance().pingServer((connected) => {
                NetworkProvider.getInstance().notify(connected, false);
                if (callback) callback(connected);
                resolve(connected);
            });
        });
    }

    /**Check if connection available*/
    public static isOnline(): boolean {
        return NetworkProvider.previousStatus === ConnectionStatus.Online;
    }
}
