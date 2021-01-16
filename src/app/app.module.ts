import {enableProdMode, ErrorHandler, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {Network} from "@ionic-native/network/ngx";
import {Device} from "@ionic-native/device/ngx";
import {AppVersion} from "@ionic-native/app-version/ngx";
import {SecureStorage} from "@ionic-native/secure-storage/ngx";
import {BarcodeScanner} from "@ionic-native/barcode-scanner/ngx";

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {IonicStorageModule} from "@ionic/storage";
import {Camera} from "@ionic-native/camera/ngx";
import {DatePicker} from "@ionic-native/date-picker/ngx";
import {File} from "@ionic-native/file/ngx";
import {FilePath} from "@ionic-native/file-path/ngx";
import {AES256} from "@ionic-native/aes-256/ngx";
import {InAppBrowser} from "@ionic-native/in-app-browser/ngx";
import {DEFAULT_TIMEOUT, TimeoutInterceptor} from "./services/TimeoutInterceptor";
import {Deeplinks} from "@ionic-native/deeplinks/ngx";
import {ENVIRONMENT, CONFIGS} from "../environments/environment";
import {AuthGuard} from "./services/AuthGuard";
import { ServiceWorkerModule } from '@angular/service-worker';

import Bugsnag from '@bugsnag/js'
import {BugsnagErrorHandler} from '@bugsnag/plugin-angular'

//Turn on production mode
if(CONFIGS.production){
    enableProdMode();
}

// Configure Bugsnag
if(CONFIGS.bugsnag_key){
    Bugsnag.start({ 
        apiKey: CONFIGS.bugsnag_key,
        releaseStage: ENVIRONMENT.toString(),
        appVersion: CONFIGS.app_version,
        appType: "HTTP"
    });
}

// Create a factory which will return the Bugsnag error handler
export function errorHandlerFactory() {
    return new BugsnagErrorHandler()
}

@NgModule({
    declarations: [AppComponent],
    entryComponents: [AppComponent],
    imports: [
        BrowserModule,
        IonicModule.forRoot({
            hardwareBackButton:true,
            rippleEffect:true,
            animated:true,
            persistConfig:true
        }),
        HttpClientModule,
        IonicStorageModule.forRoot({
            name:"wecari_storage",
            driverOrder: ['indexeddb', 'localstorage', 'websql', 'sqlite']
        }),
        AppRoutingModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: CONFIGS.production }),
    ],
    providers: [
        [{ provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true }],
        [{ provide: DEFAULT_TIMEOUT, useValue: 30000 }], //Set Http Timeout
        AuthGuard,
        StatusBar,
        SplashScreen,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        Network,
        Device,
        AppVersion,
        SecureStorage,
        BarcodeScanner,
        DatePicker,
        Camera,
        File,
        FilePath,
        AES256,
        InAppBrowser,
        Deeplinks,
        {provide: ErrorHandler, useFactory: errorHandlerFactory}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
