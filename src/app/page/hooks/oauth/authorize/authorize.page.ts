import { Component } from "@angular/core";
import { PageController } from "../../../../page/page-controller";
import { ToastType, Utils } from "../../../../helpers/Utils";
import { Urls } from "../../../../helpers/Urls";
import { Strings } from "../../.../../../../resources";
import { SessionService } from "../../../../services/app/SessionService";

@Component({
  selector: "app-authorize",
  templateUrl: "./authorize.page.html",
  styleUrls: ["./authorize.page.scss"],
})
export class AuthorizePage extends PageController {
  constructor() {
    super();
  }

  public async ngOnInit() {
    await super.ngOnInit();
    let params = await this.getQueryParams();

    //Get Authorization code and validate state
    if (
      params &&
      params.code &&
      params.state &&
      params.state == Utils.getCurrentSignature(await this.instance.sessionService.getPing())
    ) {
      this.oauth.oauthTokenWithAuthorizationCode(
        params.code,
        Urls.partnerOauthRedirectUrl,
        (token) => {
          if (token.accessToken) {
            this.oauth.saveAccess(token);
            this.instance.routeService.goHome();
          } else {
            this.showToastMsg(
              Strings.getString("error_authorize_txt"),
              ToastType.ERROR
            );
            this.instance.routeService.goToLogin();
          }
        }
      );
    } else {
      this.showToastMsg(
        Strings.getString("error_authorize_txt"),
        ToastType.ERROR
      );
      this.instance.routeService.goToLogin();
    }
  }
}
