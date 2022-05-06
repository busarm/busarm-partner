import { NgModule } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { CommonModule } from "@angular/common";

import { LoaderComponent } from "./loader.component";

import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

@NgModule({
  imports: [IonicModule, CommonModule, FontAwesomeModule],
  declarations: [LoaderComponent],
  exports: [LoaderComponent],
})
export class LoaderModule {}
