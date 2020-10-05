import {Injectable} from '@angular/core';
import {Network} from '@ionic-native/network/ngx';
import {HttpClient} from "@angular/common/http";
import {Urls} from "./Urls";
import {Events} from "@ionic/angular";
import {AppComponent} from "../app.component";
import {EventsParams} from "./EventsParams";
// import {Promise} from "q";

export enum ConnectionStatus {
    Unknown,
    Online,
    Offline
}

@Injectable()
export class NetworkProvider {

    private pingUrl: string = Urls.pingUrl;
    public static previousStatus: ConnectionStatus = ConnectionStatus.Unknown;

    private static instance: NetworkProvider;

    constructor(public network: Network,
                public eventCtrl: Events,
                public httpClient: HttpClient) {}

    /**Initialize Network provider*/
    public static async initialize(context:AppComponent){
        NetworkProvider.instance = new NetworkProvider(context.network,context.events,context.httpClient);
        /*Subscribe to internet changes*/
        return await NetworkProvider.instance.initializeNetworkEvents();
    }

    /**Get Connection instance*/
    public static getInstance():NetworkProvider{
        return this.instance;
    }

    /**Start connection check*/
    public async initializeNetworkEvents() {
        return await this.network.onChange().subscribe(()=>{
            return new Promise(resolve => {
                this.pingServer(connected =>{
                    this.notify(connected,false);
                    resolve(connected);
                });
            })
        });
    }

    /**Notify response*/
    private notify(connected:boolean,trigger:boolean = false):void{
        if (connected) {
            if (trigger && NetworkProvider.previousStatus != ConnectionStatus.Online) {
                this.eventCtrl.publish(EventsParams.Online_Event);
            }
            NetworkProvider.previousStatus = ConnectionStatus.Online;
        }
        else {
            if (trigger && NetworkProvider.previousStatus != ConnectionStatus.Offline) {
                this.eventCtrl.publish(EventsParams.Offline_Event);
            }
            NetworkProvider.previousStatus = ConnectionStatus.Offline;
        }
    }

    /**Ping online server to check if connected*/
    private pingServer(callback: (connected: boolean) => any) {
        this.httpClient.get(this.pingUrl)
            .subscribe(() => {
                callback(true);
            }, () => {
                callback(false);
            });
    }

    /**Check if connection available*/
    public static isOnline(): boolean {
        return NetworkProvider.previousStatus === ConnectionStatus.Online;
    }

    /**Check if connection available*/
    public static checkConnection(callback: (connected: boolean) => any) {
        /*Get Current network states*/
        NetworkProvider.getInstance().pingServer(connected => {
            NetworkProvider.getInstance().notify(connected,false);
            callback(connected);
        });
    }
}