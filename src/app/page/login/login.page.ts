import { Component } from "@angular/core";
import { Platform } from "@ionic/angular";

import { Strings } from "../../resources";
import { PageController } from "../page-controller";
import { Utils } from "../../helpers/Utils";
import { ToastType } from "../../services/app/AlertService";
import { Urls } from "../../helpers/Urls";
import { CONFIGS } from "../../../environments/environment";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
})
export class LoginPage extends PageController {
  private redirectUri: string;

  private maxRequests = 5;
  private maxRequestSeconds = 60;

  public username: string;
  public password: string;
  public forgottenPassword: boolean;
  public requestDate: Date;
  public requestCount: number = 0;

  platform: Platform;

  constructor(platform: Platform) {
    super();
    this.platform = platform;
  }

  public async ngOnInit() {
    super.ngOnInit();
    this.redirectUri = (await this.getQueryParams()).redirectUri; // get redirect Uri
  }

  public async ionViewDidEnter() { }

  /**Process user Login request
   * */
  public login() {
    if (this.forgottenPassword) {
      this.confirmForgotPassword();
    } else {
      this.processLogin();
    }
  }

  private isProccessing = false
  /**
   * Process Login
   */
  public processLogin() {
    // Check if processing
    if (this.isProccessing) return;
    // Check request limit
    if (this.requestDate &&
      this.requestCount >= this.maxRequests &&
      (new Date().getTime() - this.requestDate.getTime()) < (this.maxRequestSeconds * 1000)) {
      this.showToastMsg(Strings.getString("error_login_limit"), ToastType.ERROR);
      return;
    }

    // Show Loader
    this.showLoading().then(() => {
      this.isProccessing = true;
      this.instance.authService
        .login(this.username, this.password)
        .then(async (success) => {
          // Hide Loader
          await this.hideLoading();
          this.isProccessing = false;
          if (success) {
            if (this.redirectUri) {
              // Set Redirect uri as root
              this.instance.routeService.setRootPage(this.redirectUri);
            } else {
              // Load Home
              await this.instance.routeService.goHome();
              // Trigger access granted event
              this.events.accessGranted.next(true);
            }
          } else {
            await this.instance.authService.logout();
          }
          this.requestDate = new Date();
          this.requestCount = ++this.requestCount;
        })
        .catch(async (msg) => {
          // Hide Loader
          await this.hideLoading();
          // Login Failed
          await this.showToastMsg(
            this.assertAvailable(msg)
              ? msg
              : Strings.getString("error_unexpected"),
            ToastType.ERROR
          );
          this.isProccessing = false;
          this.requestDate = new Date();
          this.requestCount = ++this.requestCount;
        });
    });
  }

  /**Show confirmation
   * */
  public confirmForgotPassword() {
    this.showAlert(
      this.strings.getString("forgot_password_title_txt"),
      this.strings.getString("forgot_password_msg_txt"),
      {
        title: this.strings.getString("no_txt"),
      },
      {
        title: this.strings.getString("yes_txt"),
        callback: async () => {
          // Trigger Oauth email login
          this.oauth.oauthAuthorizeWithEmail(
            CONFIGS.oauth_scopes,
            Urls.partnerOauthRedirectUrl,
            this.username,
            Utils.getCurrentSignature(
              await this.instance.sessionService.getPing()
            )
          );
        },
      }
    );
  }
}
