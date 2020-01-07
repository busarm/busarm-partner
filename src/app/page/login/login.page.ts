import { Component} from '@angular/core';

import {Strings} from "../../resources";
import {ApiResponseType} from "../../utils/Api";
import {PageController} from "../page-controller";
import {OauthGrantType} from "../../utils/Oauth";
import {ToastType, Utils} from "../../utils/Utils";
import {NetworkProvider} from "../../utils/NetworkProvider";
import {SessionManager} from "../../utils/SessionManager";
import { Urls } from '../../utils/Urls';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage extends PageController{

    public username: string;
    public password: string;

    forgottenPassword: boolean;

    constructor() {
        super();
    }

    public async ngOnInit(){}
    public async ionViewDidEnter(){}


    /**Process user Login request
     * */
    public login()
    {
        if(this.forgottenPassword){
            this.confirmForgotPassword();
        }
        else {
            this.processLogin();
        }
    }

    /**
     * Process Login
     */
    public processLogin(){
        if(NetworkProvider.isOnline()){

            //Show Loader
            this.showLoading().then(()=>{

                //Trigger Oauth login
                this.oauth.authorizeAccess({
                    grant_type: OauthGrantType.User_Credentials,
                    username: this.username,
                    password: this.password,
                    callback: async (token,msg) => {
                        if (token) {
                            await this.instance.validate_session( async (status, msg, responseType) => {

                                //Hide Loader
                                await this.hideLoading();

                                if (status){
                                    this.instance.authorized = true;

                                    //Load Home
                                    await this.instance.goHome();
                                    this.instance.hideLoadingScreen();
                                }
                                else{
                                    this.instance.authorized = false;
                                    switch (responseType){
                                        case ApiResponseType.Api_Error:
                                            await SessionManager.logout();
                                            break;
                                    }

                                    //Show error message
                                    await this.showToastMsg(msg,ToastType.ERROR);
                                }
                            });
                        }
                        else {

                            //Hide Loader
                            await this.hideLoading();

                            //Login Failed
                            await this.showToastMsg(
                                this.assertAvailable(msg)?
                                    msg:
                                    Strings.getString("error_unexpected"),
                                ToastType.ERROR);
                        }
                    }
                });
            });

        }
        else{
            this.showNotConnectedMsg();
        }
    }

    /**Show confirmation
     * */
    public confirmForgotPassword() {
        this.showAlert(
            this.strings.getString("forgot_password_title_txt"),
            this.strings.getString("forgot_password_msg_txt"),
            {
                title: this.strings.getString("no_txt")
            },
            {
                title: this.strings.getString("yes_txt"),
                callback: async  () => {
                    //Trigger Oauth email login
                    let state = await Utils.getCurrentInstance();
                    this.oauth.oauthAuthorizeWithEmail(
                        ['agent'],
                        Urls.partnerOauthRedirectUrl,
                        this.username,
                        state)
                }
            },
        );
    }
}
