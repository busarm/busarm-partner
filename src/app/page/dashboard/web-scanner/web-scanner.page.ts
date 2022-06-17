import { Component, ViewChild } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { ZXingScannerComponent } from "@zxing/ngx-scanner";
import { BarcodeFormat } from "@zxing/library";
import { PageController } from "../../page-controller";
import { ToastType } from "../../../services/app/AlertService";

@Component({
  selector: "app-web-scanner",
  templateUrl: "./web-scanner.page.html",
  styleUrls: ["./web-scanner.page.scss"],
})
export class WebScannerPage extends PageController {
  @ViewChild("scanner") scanner: ZXingScannerComponent;

  allowedFormats = [];

  cameraLoaded: boolean = false;
  cameraFailed: boolean = false;
  cameraPermissionGranted: boolean = false;
  flashAllowed: boolean = false;
  multiDeviceAllowed: boolean = false;

  flashEnabled: boolean = false;
  mediaDevices: MediaDeviceInfo[] = [];
  selectedDeviceindex: number = 0;

  lastScanned: { timestamp: number; code: string } = null;

  constructor(private modalCtrl: ModalController) {
    super();
    this.allowedFormats = [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.EAN_13,
      BarcodeFormat.CODE_128,
      BarcodeFormat.DATA_MATRIX /*, ...*/,
    ];
  }

  public async ngOnInit() {
    await super.ngOnInit();
    this.subscriptions.add(
      this.scanner.torchCompatible.subscribe((enabled: boolean) => {
        this.flashAllowed = enabled;
      })
    );
    this.subscriptions.add(
      this.scanner.autostarted.subscribe(() => {
        this.checkMediaDevice((device) => {
          if (device) {
            this.scanner.torch = false;
            this.scanner.autofocusEnabled = true;
            this.scanner.previewFitMode = "contain";
            this.scanner.formats = this.allowedFormats;
            this.scanner.timeBetweenScans = 0;
            this.cameraLoaded = this.scanner.enabled;
          } else {
            this.showToastMsg(
              this.strings.getString("no_camera_msg"),
              ToastType.ERROR,
              3000
            );
            this.cameraFailed = true;
          }
        });
      })
    );
    this.subscriptions.add(
      this.scanner.scanSuccess.subscribe((code: any) => {
        if (this.canScanAgain(code)) {
          this.lastScanned = { timestamp: Date.now(), code: code };
          this.dismiss(code);
        }
      })
    );
    this.checkPermission();
  }

  /**Search input event
   * @param event
   * @param {boolean} isSearch
   */
  public onInput(event: any, isSearch: boolean = false) {
    if (event.isTrusted) {
      if (
        isSearch &&
        event.target.value &&
        event.target.value.length > 6 &&
        this.canScanAgain(event.target.value, 1000)
      ) {
        this.lastScanned = {
          timestamp: Date.now(),
          code: String(event.target.value).toUpperCase().trim(),
        };
        this.dismiss(event.target.value);
      }
    }
  }

  /**Reset Search
   * @param event
   */
  public onClear(event: CustomEvent) {
    if (event.isTrusted) {
      this.lastScanned = null;
    }
  }
  /**
   * Check if can scan code again
   * This is to prevent scanning the same code
   * too many times at an instance
   * @param code
   * @param interval Milliseconds - default 5s
   * @return boolean
   */
  private canScanAgain(code: string, interval = 5000) {
    return !(
      this.lastScanned &&
      this.lastScanned.code.toLocaleUpperCase() === code.toLocaleUpperCase() &&
      this.lastScanned.timestamp + interval >= Date.now()
    );
  }

  /* Check media camera devices
   * */
  private checkMediaDevice(callback?: (device?: MediaDeviceInfo) => any) {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      let checking = ["videoinput"];
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          this.mediaDevices = devices.filter((device) =>
            checking.includes(device.kind)
          );
          this.multiDeviceAllowed =
            this.mediaDevices && this.mediaDevices.length >= 2;
          if (callback) {
            this.selectedDeviceindex = this.multiDeviceAllowed ? 1 : 0;
            callback(this.mediaDevices[this.selectedDeviceindex]);
          }
        })
        .catch(() => {
          this.mediaDevices = [];
          if (callback) {
            callback();
          }
        });
    } else {
      this.mediaDevices = [];
      if (callback) {
        callback();
      }
    }
  }
  /* Check camera Permission
   * */
  public checkPermission() {
    this.scanner.askForPermission().then((granted) => {
      if (!granted) {
        this.cameraPermissionGranted = false;
        this.cameraLoaded = false;
        this.cameraFailed = true;
      } else {
        this.cameraPermissionGranted = true;
      }
    });
  }

  public ionViewDidLeave() {
    super.ionViewDidLeave();
  }

  /**
   * Toggle Flash on & off
   * @param toggle
   */
  public async toggleFlash() {
    if (this.scanner) {
      this.flashEnabled = !this.flashEnabled;
      this.scanner.torch = this.flashEnabled;
    }
  }

  /**
   * Change Media Device
   */
  public async changeMediaDevice() {
    if (this.multiDeviceAllowed) {
      if (this.selectedDeviceindex + 1 >= this.mediaDevices.length) {
        if (
          this.scanner &&
          !this.scanner.isCurrentDevice(this.mediaDevices[0])
        ) {
          this.scanner.device = this.mediaDevices[0];
          this.selectedDeviceindex = 0;
        }
      } else {
        if (
          this.scanner &&
          !this.scanner.isCurrentDevice(
            this.mediaDevices[this.selectedDeviceindex + 1]
          )
        ) {
          this.scanner.device = this.mediaDevices[this.selectedDeviceindex + 1];
          this.selectedDeviceindex = this.selectedDeviceindex + 1;
        }
      }
    }
  }

  /**Close Modal*/
  async dismiss(code?: string) {
    const modal = await this.modalCtrl.getTop();
    if (modal) modal.dismiss(code);
  }
}
