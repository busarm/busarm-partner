/**Use this class to manage
 * the all data stored in the session
 * */
import { SecureStorageObject } from "@ionic-native/secure-storage/ngx";
import { PingObject, UserInfo, Session } from "../models/ApiResponse";
import { Utils } from "./Utils";
import { AppComponent } from "../app.component";
import { Storage } from "@ionic/storage";
import { OauthStorage } from "./Oauth";

export class SessionManager {
    private static session_info = "session_info";
    private static ping = "ping";

    private static context: AppComponent;
    private static sessionManager: SessionManager;
    private storage: Storage;

    /**Initialize*/
    public static initialize(context: AppComponent) {
        this.context = context;
        this.sessionManager = new SessionManager();
        this.sessionManager.storage = context.storage;
    }

    /**Initialize Secure storage*/
    private static initSecureStorage(
        secureStorageCallback?: (secureStorage: SecureStorageObject) => any
    ) {
        let subscription = this.context.secureStorage.create(
            "wecari_secure_storage"
        );
        if (Utils.assertAvailable(subscription)) {
            //use Secure Storage if available
            subscription
                .then((value) => {
                    console.log("Secure Storage is ready!");
                    if (Utils.assertAvailable(secureStorageCallback))
                        secureStorageCallback(value);
                })
                .catch(() => {
                    console.log("Secure Storage failed!");
                    if (Utils.assertAvailable(secureStorageCallback))
                        secureStorageCallback(null);
                });
        } else {
            if (Utils.assertAvailable(secureStorageCallback))
                secureStorageCallback(null);
        }
    }

    /** Set data - localStorage
     * @param key  key
     * @param callback
     * @param value  value
     * @return Promise if no callback given
     * */
    static set(
        key: string,
        value: any,
        callback?: (status: boolean) => any
    ): Promise<boolean> {
        if (this.sessionManager.storage != null) {
            return new Promise(async (resolve) => {
                this.sessionManager.storage
                    .set(key, value)
                    .then(() => {
                        if (Utils.assertAvailable(callback)) callback(true);
                        else resolve(true);
                    })
                    .catch(() => {
                        if (Utils.assertAvailable(callback)) callback(false);
                        else resolve(false);
                    });
            });
        } else {
            return new Promise((resolve) => {
                if (typeof value === "object")
                    localStorage.setItem(key, Utils.toJson(value));
                else localStorage.setItem(key, value);

                if (Utils.assertAvailable(callback)) callback(true);
                else resolve(true);
            });
        }
    }

    /** Get data - localStorage
     * @param key  key
     * @param callback
     * @return Promise if no callback given
     * */
    static async get(key: string, callback?: (data: any) => any): Promise<any> {
        if (this.sessionManager.storage != null) {
            return new Promise(async (resolve) => {
                this.sessionManager.storage
                    .get(key)
                    .then((value) => {
                        if (Utils.assertAvailable(callback)) callback(value);
                        else resolve(value);
                    })
                    .catch(() => {
                        if (Utils.assertAvailable(callback)) callback(null);
                        else resolve(null);
                    });
            });
        } else {
            return new Promise((resolve) => {
                let value = localStorage.getItem(key);
                let obj = Utils.parseJson(value);
                if (Utils.assertAvailable(callback))
                    callback(Utils.assertAvailable(obj) ? obj : value);
                else resolve(Utils.assertAvailable(obj) ? obj : value);
            });
        }
    }

    /** Remove data - localStorage
     * @param key  string
     * */
    static async remove(key: string): Promise<any> {
        if (this.sessionManager.storage != null) {
            return this.sessionManager.storage.remove(key);
        } else {
            return new Promise((resolve) => {
                localStorage.removeItem(key);
                resolve(true);
            });
        }
    }

    /** Remove all data - localStorage
     * */
    static async clear(): Promise<any> {
        if (this.sessionManager.storage != null) {
            return this.sessionManager.storage.clear();
        } else {
            return new Promise((resolve) => {
                localStorage.clear();
                resolve(true);
            });
        }
    }

    /** Get User Info from session
     * @param callback
     * */
    static getUserInfo(callback?: (data: UserInfo) => any): Promise<UserInfo> {
        if (Utils.assertAvailable(callback)) {
            return this.getSession((session) => {
                callback(session ? session.user : null);
            });
        } else {
            return new Promise<UserInfo>(async (resolve) => {
                await this.getSession((session) => {
                    resolve(session ? session.user : null);
                });
            });
        }
    }

    /**Save User info to session
     * @param user
     * @param callback
     * */
    static setUserInfo(user: UserInfo, callback?: (status: boolean) => any) {
        if (Utils.assertAvailable(callback)) {
            return this.getSession((session) => {
                if (session) session.user = user;
                return this.setSession(session, callback);
            });
        } else {
            return new Promise<Boolean>(() => {
                return this.getSession((session) => {
                    if (session) session.user = user;
                    return this.setSession(session);
                });
            });
        }
    }

    /** Get Ping Data from session
     * @param callback
     * */
    static getPing(callback?: (data: PingObject) => any): Promise<PingObject> {
        return this.get(this.ping, callback);
    }

    /**Save Ping Data to session
     * @param ping
     * @param callback
     * */
    static setPing(ping: PingObject, callback?: (status: boolean) => any) {
        return this.set(this.ping, ping, callback);
    }

    /**Get Session Token
     * @param callback
     * */
    static getSession(callback?: (data: Session) => any): Promise<Session> {
        return this.get(this.session_info, callback);
    }

    /**Set Session Token
     * @param session
     * @param callback
     * */
    static setSession(session: Session, callback?: (status: boolean) => any) {
        return this.set(this.session_info, session, callback);
    }

    /**
     * Logout user
     * @param redirectUri
     */
    static async logout(redirectUri?: string) {
        this.clear();
        OauthStorage.clearAccess();
        this.context.authorized = false;
        await this.context.goToLogin(
            redirectUri ? { queryParams: { redirectUri: redirectUri } } : {}
        );
        if (!this.context.loaded) {
            this.context.hideLoadingScreen();
        }
    }
}
