import { Component, OnInit } from '@angular/core';
import { PageController } from '../../../../page/page-controller';
import { ToastType, Utils } from '../../../../libs/Utils';
import { OauthStorage } from '../../../../libs/Oauth';
import { Urls } from '../../../../libs/Urls';
import { Strings } from '../../.../../../../resources';
 
@Component({
  selector: 'app-authorize',
  templateUrl: './authorize.page.html',
  styleUrls: ['./authorize.page.scss'],
})
export class AuthorizePage extends PageController {
 
  constructor() {
    super();
  }

  
  public async ngOnInit() {
    await super.ngOnInit();
    let params = await this.getQueryParams()

    //Get Authorization code and validate state
    if(params && params.code && params.state && params.state == (Utils.getCurrentSignature(await this.instance.getPingStatus()))){
      this.oauth.oauthTokenWithAuthorizationCode(params.code, Urls.partnerOauthRedirectUrl, (token) =>{
        if(token.accessToken){
          OauthStorage.saveAccess(token);
          this.instance.goHome();
        }
        else {
          this.showToastMsg(Strings.getString("error_authorize_txt"), ToastType.ERROR);
          this.instance.goToLogin();
        }
      });
    }
    else {
      this.showToastMsg(Strings.getString("error_authorize_txt"), ToastType.ERROR);
      this.instance.goToLogin();
    }
  }
}
