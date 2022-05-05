import { Component } from "@angular/core";
import { Platform } from "@ionic/angular";

import { OauthGrantType } from "busarm-oauth-client-js";

import { Strings } from "../../resources";
import { ApiResponseType } from "../../helpers/Api";
import { PageController } from "../page-controller";
import { ToastType, Utils } from "../../helpers/Utils";
import { SessionService } from "../../services/app/SessionService";
import { Urls } from "../../helpers/Urls";
import { CONFIGS } from "../../../environments/environment";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
})
export class LoginPage extends PageController {
  private redirectUri: string;

  public username: string;
  public password: string;
  public forgottenPassword: boolean;

  platform: Platform;

  constructor(platform: Platform) {
    super();
    this.platform = platform;
  }

  public async ngOnInit() {
    super.ngOnInit();
    this.redirectUri = (await this.getQueryParams()).redirectUri; // get redirect Uri
  }

  public async ionViewDidEnter() {}

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
    if(this.isProccessing) return;
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
