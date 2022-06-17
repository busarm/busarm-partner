import { Injectable } from "@angular/core";
import { BarcodeScanner } from "@ionic-native/barcode-scanner/ngx";
import { ModalController, Platform } from "@ionic/angular";
import { AlertService, ToastType } from "./AlertService";
import { Events } from "./Events";
import { WebScannerPage } from "../../page/dashboard/web-scanner/web-scanner.page";

@Injectable({
  providedIn: "root",
})
export class ScannerService {

  public webScanAvailable: boolean;

  constructor(
    private events: Events,
    private platform: Platform,
    private alertService: AlertService,
    private barcodeScanner: BarcodeScanner,
    private modalCtrl: ModalController
  ) {
  }

  /**Launch scan Qr Code page
   */
  async showScanCode() {
    // If native
    if (this.platform.is("cordova")) {
      this.barcodeScanner
        .scan({
          resultDisplayDuration: 0,
          disableSuccessBeep: false,
          showTorchButton: true,
        })
        .then((barcodeData) => {
          if (barcodeData.text && barcodeData.text != "") {
            this.events.webScannerCompleted.next(barcodeData.text);
          }
        })
        .catch((e) => {
          this.alertService.showToastMsg(e, ToastType.ERROR);
        });
    }
    // If browser
    else {
      let chooseModal = await this.modalCtrl.create({
        component: WebScannerPage,
        componentProps: {
          isModal: true,
        },
      });
      chooseModal.onDidDismiss().then((data) => {
        if (data.data) {
          if (data.data && data.data != "") {
            this.events.webScannerCompleted.next(data.data);
          }
        }
      });
      return await chooseModal.present();
    }
  }
}
