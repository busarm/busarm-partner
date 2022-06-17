import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";
import { ZXingScannerModule } from "@zxing/ngx-scanner";

import { WebScannerPage } from "./web-scanner.page";
import { RouterModule, Routes } from "@angular/router";
import { LoaderModule } from "../../../components/loader/loader.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ZXingScannerModule,
    LoaderModule
  ],
  declarations: [WebScannerPage],
})
export class WebScannerPageModule {}
