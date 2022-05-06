import { Injectable } from "@angular/core";
import { AppVersion } from "@ionic-native/app-version/ngx";
import { Device } from "@ionic-native/device/ngx";
import { Platform } from "@ionic/angular";
import {
  Oauth,
  OauthGrantType,
  OauthStorageKeys,
} from "busarm-oauth-client-js";

import { Api, ApiResponse, ApiResponseType } from "../../helpers/Api";
import { SessionService } from "./SessionService";
import { Urls } from "../../helpers/Urls";
import { Utils } from "../../helpers/Utils";
import { Session } from "../../models/Session";
import { Langs, Strings } from "../../resources";
import { CONFIGS } from "../../../environments/environment";
import { NetworkProvider } from "./NetworkProvider";
import { Events } from "./Events";
import { RouteService } from "./RouteService";
import { BaseResponse } from "../../models/BaseResponse";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  /**Get app instance*/
  public static get instance(): AuthService {
    return AuthService._instance;
  }
  private static _instance: AuthService;

  private oauth: Oauth;

  public authAttempted = false;
  public authorized = false;

  constructor(
    public networkProvider: NetworkProvider,
    public platform: Platform,
    private device: Device,
    private appVersion: AppVersion,
    public routeService: RouteService,
    private sessionService: SessionService,
    public events: Events
  ) {
    // Initialize Oauth
    this.oauth = new Oauth({
      clientId: CONFIGS.oauth_client_id,
      clientSecret: CONFIGS.oauth_client_secret,
      authorizeUrl: Urls.oauthAuthorizeUrl,
      tokenUrl: Urls.oauthTokenUrl,
      verifyTokenUrl: Urls.oauthVerifyTokenUrl,
    });
    AuthService._instance = this;
  }

  /**
   * Get oauth instance
   * @returns {Oauth}
   */
  public getOauth(): Oauth {
    return this.oauth;
  }

  /**
   * Authorize User
   * @param {Boolean} force
   * @returns {Promise<boolean>}
   */
  public authorize(force: boolean = false): Promise<boolean> {
    return new Promise(
      async (
        resolve: (status: boolean) => any,
        reject: (reason: string) => any
      ) => {
        if ((!this.authorized && !this.authAttempted) || force) {
          // To prevent duplicate request
          this.authAttempted = true;
          // Authorize
          this.oauth.authorizeAccess({
            scope: CONFIGS.oauth_scopes,
            grant_type: OauthGrantType.Auto,
            state: Utils.getCurrentSignature(
              await this.sessionService.getPing()
            ),
            callback: async (token) => {
              if (token) {
                // Validate Session
                let result = await this.validateSession();
                if (result) {
                  if (result.status) {
                    this.authorized = true;
                    this.authAttempted = false;
                    resolve(true);
                  } else {
                    this.authAttempted = false;
                    switch (result.type) {
                      case ApiResponseType.Authorization_error:
                        this.authorized = false;
                        resolve(false);
                        break;
                      default:
                        if (await this.sessionService.getSession()) {
                          this.authorized = true;
                          resolve(true);
                        } else {
                          this.authorized = false;
                          reject(
                            result.msg || Strings.getString("error_unexpected")
                          );
                        }
                    }
                  }
                } else {
                  this.authAttempted = false;
                  reject(Strings.getString("error_unexpected"));
                }
              } else {
                this.authAttempted = false;
                resolve(false);
              }
            },
          });
        } else {
          resolve(this.authorized && !(await this.oauth.hasExpired()));
        }
      }
    );
  }

  /**
   * Login User
   */
  public login(username: string, password: string): Promise<boolean> {
    return new Promise(
      (resolve: (success: boolean) => any, reject: (reason: string) => any) => {
        // Trigger Oauth login
        this.oauth.authorizeAccess({
          grant_type: OauthGrantType.User_Credentials,
          username,
          password,
          callback: async (token, msg) => {
            if (token) {
              let result = await this.validateSession();
              if (result) {
                if (result.status) {
                  this.authorized = true;
                  resolve(true);
                } else {
                  this.authorized = false;
                  switch (result.type) {
                    case ApiResponseType.Api_Error:
                      await this.logout();
                      break;
                  }
                  reject(result.msg);
                }
              } else {
                reject(msg ? msg : Strings.getString("error_unexpected"));
              }
            } else {
              reject(msg ? msg : Strings.getString("error_unexpected"));
            }
          },
        });
      }
    );
  }

  /**
   * Check if user is authorize
   * and verify token if existing
   * @returns {Promise<boolean>}
   */
  public async isAuthorize(): Promise<boolean> {
    return !(await this.oauth.hasExpired());
  }

  /**
   * Get Auth Session Params
   * @returns {Promise<AuthSessionParams>}
   */
  public async getAuthSessionParams(): Promise<AuthSessionParams> {
    const appVersion = this.platform.is("cordova")
      ? await this.appVersion
          .getVersionNumber()
          .then((value) => {
            return value;
          })
          .catch(() => {
            return CONFIGS.app_version;
          })
      : CONFIGS.app_version;
    const appName = this.platform.is("cordova")
      ? await this.appVersion
          .getAppName()
          .then((value) => {
            return value;
          })
          .catch(() => {
            return CONFIGS.app_name;
          })
      : CONFIGS.app_version;

    const platform = this.platform.is("android")
      ? "Android"
      : this.platform.is("ios")
      ? "IOS"
      : this.platform.is("desktop")
      ? "Desktop"
      : "Unknown";

    const deviceType = this.platform.is("mobile")
      ? "Phone"
      : this.platform.is("tablet")
      ? "Tablet"
      : this.platform.is("desktop")
      ? "Computer"
      : "Unknown";

    const os =
      this.platform.is("cordova") &&
      Utils.assertAvailable(this.device.platform) &&
      Utils.assertAvailable(this.device.version)
        ? this.device.platform + " " + this.device.version
        : platform;

    const deviceModel =
      this.platform.is("cordova") &&
      Utils.assertAvailable(this.device.manufacturer) &&
      Utils.assertAvailable(this.device.model)
        ? this.device.manufacturer + " " + this.device.model
        : this.platform.is("cordova") &&
          Utils.assertAvailable(this.device.manufacturer)
        ? this.device.manufacturer
        : null;

    return {
      appVersion,
      appName,
      platform,
      deviceType,
      os,
      deviceModel,
    };
  }

  /**
   *
   * Validate existing session, or create one
   * @returns {Promise<ApiResponse<BaseResponse>>}
   */
  public async validateSession(): Promise<ApiResponse<BaseResponse>> {
    // Get session params
    let data = await this.getAuthSessionParams();
    return new Promise((resolve: (data: ApiResponse<BaseResponse>) => any) => {
      Api.initialize(
        {
          os: data.os,
          version: data.appVersion,
          app_name: data.appName,
          device_type: data.deviceType,
          device_name: data.deviceModel,
          partner: true,
        },
        async ({ status, result, type, msg }) => {
          if (status && result) {
            let session: Session = result.data;
            // Save  session info
            await this.sessionService.setSession(session);
            if (session.user) {
              // Set app's Language with user's
              if (Utils.assertAvailable(session.user.lang)) {
                const key = session.user.lang.toUpperCase();
                if (Langs[key]) {
                  // If Language Supported
                  Strings.setLanguage(key);
                }
              }
              resolve({ status, result, type, msg });
            } else {
              resolve({
                status: false,
                msg: Strings.getString("error_unexpected"),
                type,
              });
            }
          } else {
            resolve({
              status: false,
              msg: msg || Strings.getString("error_unexpected"),
              type: type,
            });
          }
        }
      );
    });
  }

  /**
   * Logout user
   * @param redirectUri
   */
  async logout(redirect = true, redirectUri?: string) {
    await this.clearAccess();
    await this.sessionService.clear();
    if (redirect) {
      await this.routeService.goToLogin(
        redirectUri ? { queryParams: { redirectUri: redirectUri } } : {}
      );
    }
    // Trigger logout event
    this.events.logoutTriggered.next(true);
  }
  /**
   * Clear user access
   */
  async clearAccess() {
    return this.oauth.clearAccess();
  }
}

export interface AuthSessionParams {
  appName: string;
  appVersion: string;
  platform?: string;
  deviceType?: string;
  os?: string;
  deviceModel?: string;
}
