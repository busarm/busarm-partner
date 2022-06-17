import { Component } from "@angular/core";
import { ActionSheetController, Platform } from "@ionic/angular";
import { Network } from "@ionic-native/network/ngx";
import { Utils } from "../../helpers/Utils";
import { ToastType } from "../../services/app/AlertService";
import { PageController } from "../page-controller";
import { SessionService } from "../../services/app/SessionService";
import { Api } from "../../helpers/Api";
import {
  Camera,
  CameraOptions,
  PictureSourceType,
} from "@ionic-native/camera/ngx";
import { File, FileEntry } from "@ionic-native/file/ngx";
import { Strings } from "../../resources";
import { DestinationType } from "@ionic-native/camera";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { Urls } from "../../helpers/Urls";
import { Oauth, OauthStorageKeys } from "busarm-oauth-client-js";
@Component({
  selector: "app-account",
  templateUrl: "./account.page.html",
  styleUrls: ["./account.page.scss"],
})
export class AccountPage extends PageController {
  public darkMode: boolean = false;

  constructor(
    private actionSheetController: ActionSheetController,
    private camera: Camera,
    private file: File,
    private iab: InAppBrowser,
    public network: Network,
    public platform: Platform
  ) {
    super();
  }

  public async ngOnInit() {
    await super.ngOnInit();
    this.subscriptions.add(
      this.events.darkModeChanged.subscribe((enabled) => {
        this.darkMode = enabled;
      })
    );
    this.darkMode = (await this.instance.sessionService.getDarkMode());
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  public async ionViewDidEnter() {
    this.darkMode = (await this.instance.sessionService.getDarkMode());
  }

  /**On Input change listener*/
  changeListener(event: { isTrusted: any; target: { files: any[]; }; }) {
    if (event && event.isTrusted) {
      this.readFile(event.target.files[0]);
    }
  }

  /**Select Image to upload*/
  async selectImage() {
    const actionSheet = await this.actionSheetController.create({
      header: this.strings.getString("select_image_source_txt"),
      buttons: [
        {
          text: this.strings.getString("load_library_txt"),
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          },
        },
        {
          text: this.strings.getString("use_camera_txt"),
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          },
        },
        {
          text: this.strings.getString("cancel_txt"),
          role: "cancel",
        },
      ],
    });
    await actionSheet.present();
  }

  /**Initiate Photo Source*/
  takePicture(sourceType: PictureSourceType) {
    let options: CameraOptions = {
      destinationType: DestinationType.FILE_URL,
      quality: 80,
      allowEdit: true,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true,
    };

    this.camera.getPicture(options).then((imagePath) => {
      this.startUpload(imagePath);
    });
  }

  /**Initiate File Upload*/
  startUpload(filePath: string) {
    this.file
      .resolveLocalFilesystemUrl(filePath)
      .then((entry) => {
        (<FileEntry>entry).file((file) => this.readFile(file));
      })
      .catch((err) => {
        // this.showToastMsg('Error while reading file.',ToastType.ERROR);
        this.showToastMsg(err, ToastType.ERROR);
      });
  }

  /**Get file from storage*/
  readFile(file: any) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const formData = new FormData();
      const imgBlob = new Blob([reader.result], {
        type: file.type,
      });
      formData.append("partnerLogo", imgBlob, file.name);
      this.uploadImageData(formData);
    };
    reader.readAsArrayBuffer(file);
  }

  /**Upload File to server*/
  uploadImageData(formData: FormData) {
    this.showLoading().then(() => {
      Api.addPartnerLogo(formData, ({ status, result, msg }) => {
        this.hideLoading();
        if (status) {
          if (this.assertAvailable(result)) {
            if (result.status) {
              this.showToastMsg(result.msg, ToastType.SUCCESS);
              this.getUser((status) => {
                if (status) {
                  this.loadUser();
                }
              });
            } else {
              this.showToastMsg(result.msg, ToastType.ERROR);
            }
          } else {
            this.showToastMsg(
              Strings.getString("error_unexpected"),
              ToastType.ERROR
            );
          }
        } else {
          this.showToastMsg(msg, ToastType.ERROR);
        }
      });
    });
  }

  /**Show Logout confirmation
   * */
  public confirmLogout() {
    this.showAlert(
      this.strings.getString("logout_txt"),
      this.strings.getString("logout_msg_txt"),
      {
        title: this.strings.getString("no_txt"),
      },
      {
        title: this.strings.getString("yes_txt"),
        callback: () => {
          this.logout();
        },
      }
    );
  }

  /**Show Agents page*/
  public showAgents() {
    this.navigate("agents");
  }

  /**Show Locations page*/
  public showLocations() {
    this.navigate("locations");
  }

  /**Show Terms and Conditions page*/
  public showTerms() {
    this.iab.create(Urls.termsUrl, "_blank", {
      zoom: "no",
      hardwareback: "yes",
    });
  }

  /**Show Privacy Policy page*/
  public showPrivacy() {
    this.iab.create(Urls.privacyUrl, "_blank", {
      zoom: "no",
      hardwareback: "yes",
    });
  }

  /**Show Support page*/
  public async showSupport() {
    let token = await Oauth.storage.get(OauthStorageKeys.AccessTokenKey);
    this.iab.create(Urls.support + "?access_token=" + token, "_blank", {
      zoom: "no",
      hardwareback: "yes",
    });
  }

  /**Show App page*/
  public async showApp() {
    let token = await Oauth.storage.get(OauthStorageKeys.AccessTokenKey);
    this.iab.create(Urls.appUrl + "?access_token=" + token, "_blank", {
      zoom: "no",
      hardwareback: "yes",
    });
  }

  /**Toggle Theme*/
  public toggleTheme() {
    this.instance.sessionService.setDarkMode(this.darkMode);
    document.body.classList.toggle("dark", this.darkMode);
  }

  /**Logout user*/
  public logout() {
    this.showLoading().then(() => {
      Api.logout(() => {
        this.instance.authService.logout();
        this.hideLoading();
      });
    });
  }

  /**Get User Data*/
  public getUser(callback?: (status: boolean, msg: string) => any) {
    Api.getUserInfo(({ status, result, msg }) => {
      if (status) {
        if (Utils.assertAvailable(result)) {
          if (result.status) {
            // Save user data to session
            this.instance.sessionService.setUserInfo(result.data, (done) => {
              if (done) {
                if (Utils.assertAvailable(callback)) {
                  callback(done, msg);
                }
              } else {
                if (Utils.assertAvailable(callback)) {
                  callback(done, Strings.getString("error_unexpected"));
                }
              }
            });
          } else {
            if (Utils.assertAvailable(callback)) {
              callback(
                false,
                result.msg ? result.msg : Strings.getString("error_unexpected")
              );
            }
          }
        } else {
          if (Utils.assertAvailable(callback)) {
            callback(false, Strings.getString("error_unexpected"));
          }
        }
      } else {
        if (Utils.assertAvailable(callback)) {
          callback(status, msg);
        }
      }
    });
  }
}
