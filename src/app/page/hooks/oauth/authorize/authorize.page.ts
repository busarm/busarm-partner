import { Component, OnInit } from '@angular/core';
import { PageController } from '../../../../page/page-controller';
import { Utils } from '../../../../libs/Utils';
import { OauthStorage } from '../../../../libs/Oauth';
import { Urls } from '../../../../libs/Urls';
 
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
    if(params && params.code && params.state && params.state == (await Utils.getCurrentInstance())){
      this.oauth.oauthTokenWithAuthorizationCode(params.code, Urls.partnerOauthRedirectUrl, (token) =>{
        if(token.accessToken){
          OauthStorage.saveAccess(token);
          this.instance.goHome();
        }
        else {
          this.instance.goToLogin();
        }
      });
    }
    else {
      this.instance.goToLogin();
    }
  }
}
