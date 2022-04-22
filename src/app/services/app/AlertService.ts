import { Injectable } from "@angular/core";
import {
  Platform,
  NavController,
  LoadingController,
  ToastController,
  AlertController,
  AlertButton,
} from "@ionic/angular";
import { Utils, ToastType } from "../../helpers/Utils";
import { Strings } from "../../resources";

@Injectable({
  providedIn: "root",
})
export class AlertService {
  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  private toast: any;
  private loader: any;
  private alert: any;

  /**
   * No Internet Connection Message
   * @param onDismiss closure
   * */
  public showNotConnectedMsg(onDismiss?: (data: any, role: string) => any) {
    return this.showToastMsg(
      Strings.getString("error_connection"),
      ToastType.ERROR,
      86400 * 1000,
      true,
      Utils.assertAvailable(onDismiss)
        ? Strings.getString("retry_txt")
        : Strings.getString("close_txt"),
      onDismiss
    );
  }

  /**
   * Toast Message
   * @param msg String
   * @param type Number
   * @param duration Number
   * @param showCloseButton boolean
   * @param closeButton
   * @param onDismiss closure
   * @param position String
   * */
  public async showToastMsg(
    msg: string,
    type: ToastType,
    duration: number = 6000,
    showCloseButton: boolean = false,
    closeButton: string = Utils.convertHTMLEntity("&times;"),
    onDismiss?: (data: any, role: string) => any,
    position: "bottom" | "top" = "bottom"
  ) {
    await this.hideToastMsg();
    this.toast = await this.toastCtrl.create({
      message: Utils.convertHTMLEntity(msg),
      duration: duration,
      cssClass: type,
      buttons: showCloseButton
        ? [
            {
              text: closeButton,
              side: "end",
              role: "cancel",
            },
          ]
        : [],
      keyboardClose: true,
      position: position,
    });
    this.toast.onDidDismiss().then((data: any, role: string) => {
      if (onDismiss) {
        onDismiss(data, role);
      }
    });
    return await this.toast.present();
  }

  /**Hide Toast Messages
   * */
  public async hideToastMsg() {
    if (this.toast != null) {
      return this.toast.dismiss();
    }
    return null;
  }

  /**Show Loading Dialog
   * */
  public async showLoading({
    msg = Strings.getString("please_wait"),
    backdropDismiss = false,
    showBackdrop = true,
  }) {
    await this.hideLoading();
    this.loader = await this.loadingCtrl.create({
      message: msg ? Utils.convertHTMLEntity(msg) : null,
      showBackdrop,
      spinner: msg ? "crescent" : "dots",
      animated: true,
      keyboardClose: true,
      backdropDismiss,
    });
    return await this.loader.present();
  }

  /**Hide Loading Dialog
   * */
  public async hideLoading() {
    if (this.loader != null) {
      return this.loader.dismiss();
    }
    return null;
  }

  /**Show Alert dialog*/
  public async showAlert(
    title?: string,
    message?: string,
    primaryBt?: {
      title: string;
      callback?: (data?: any) => any;
    },
    secondaryBt?: {
      title: string;
      callback?: (data?: any) => any;
    }
  ) {
    await this.hideAlert();
    const buttons: AlertButton[] = [];

    if (Utils.assertAvailable(primaryBt)) {
      buttons.push({
        text: primaryBt.title,
        handler: primaryBt.callback,
      });
    }
    if (Utils.assertAvailable(secondaryBt)) {
      buttons.push({
        text: secondaryBt.title,
        handler: secondaryBt.callback,
      });
    }

    this.alert = await this.alertCtrl.create({
      header: title,
      message: Utils.convertHTMLEntity(message),
      buttons: buttons,
      backdropDismiss: !(primaryBt || secondaryBt),
    });
    return await this.alert.present();
  }

  /**Hide Alert dialogs*/
  public async hideAlert() {
    if (this.alert != null) {
      return this.alert.dismiss();
    }
    return null;
  }
}
