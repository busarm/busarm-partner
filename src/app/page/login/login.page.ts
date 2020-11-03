import { Component, Input} from '@angular/core';

import {Strings} from '../../resources';
import {ApiResponseType} from '../../libs/Api';
import {PageController} from '../page-controller';
import {OauthGrantType} from '../../libs/Oauth';
import {ToastType, Utils} from '../../libs/Utils';
import {NetworkProvider} from '../../services/NetworkProvider';
import {SessionManager} from '../../libs/SessionManager';
import { Urls } from '../../libs/Urls';
import { ENVIRONMENT } from '../../../environments/environment';
import { ENV } from '../../../environments/ENV';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage extends PageController {

    private redirectUri: string;

    public username: string;
    public password: string;

    forgottenPassword: boolean;


    constructor() {
        super();
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

    /**
     * Process Login
     */
    public processLogin() {
        if (NetworkProvider.isOnline()) {

            // Show Loader
            this.showLoading().then(() => {

                // Trigger Oauth login
                this.oauth.authorizeAccess({
                    grant_type: OauthGrantType.User_Credentials,
                    username: this.username,
                    password: this.password,
                    callback: async (token, msg) => {
                        if (token) {
                            await this.instance.validate_session( async (status, msg, responseType) => {
                                // Hide Loader
                                await this.hideLoading();
                                if (status) {
                                    this.instance.authorized = true;
                                    if (this.redirectUri) {
                                        // Set Redirect uri as root
                                        this.instance.setRootPage(this.redirectUri);
                                    } else {
                                        // Load Home
                                        await this.instance.goHome();
                                        this.instance.hideLoadingScreen();
                                    }
                                } else {
                                    this.instance.authorized = false;
                                    switch (responseType) {
                                        case ApiResponseType.Api_Error:
                                            await SessionManager.logout();
                                            break;
                                    }

                                    // Show error message
                                    await this.showToastMsg(msg, ToastType.ERROR);
                                }
                            });
                        } else {

                            // Hide Loader
                            await this.hideLoading();

                            // Login Failed
                            await this.showToastMsg(
                                this.assertAvailable(msg) ?
                                    msg :
                                    Strings.getString('error_unexpected'),
                                ToastType.ERROR);
                        }
                    }
                });
            });

        } else {
            this.showNotConnectedMsg();
        }
    }

    /**Show confirmation
     * */
    public confirmForgotPassword() {
        this.showAlert(
            this.strings.getString('forgot_password_title_txt'),
            this.strings.getString('forgot_password_msg_txt'),
            {
                title: this.strings.getString('no_txt')
            },
            {
                title: this.strings.getString('yes_txt'),
                callback: async  () => {
                    // Trigger Oauth email login
                    this.oauth.oauthAuthorizeWithEmail(
                        ENVIRONMENT == ENV.TEST ?  ['openid', 'user', 'agent', 'tester'] :  ['openid', 'user', 'agent'],
                        Urls.partnerOauthRedirectUrl,
                        this.username,
                        Utils.getCurrentSignature(await this.instance.getPingStatus()));
                }
            },
        );
    }
}
