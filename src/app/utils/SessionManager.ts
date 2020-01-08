/**Use this class to manage
 * the all data stored in the session
 * */
import {SecureStorageObject} from "@ionic-native/secure-storage/ngx";
import {UserInfo, ValidateSessionObject} from "../models/ApiResponse";
import {Utils} from "./Utils";
import {AppComponent} from "../app.component";
import {Storage} from "@ionic/storage";

export class SessionManager {

    private static session_info = "session_info";
    private static user_info = "user_info";

    private static context: AppComponent;
    private static sessionManager: SessionManager;
    private storage: Storage;

    /**Initialize*/
    public static initialize(context:AppComponent) {
        this.context = context;
        this.sessionManager = new SessionManager();
        this.sessionManager.storage = context.storage;
    }

    /**Initialize Secure storage*/
    private static initSecureStorage(secureStorageCallback?:(secureStorage:SecureStorageObject)=>any){
        let subscription = this.context.secureStorage.create('wecari_secure_storage');
        if (Utils.assertAvailable(subscription)){ //use Secure Storage if available
            subscription.then(value => {
                console.log('Secure Storage is ready!');
                if(Utils.assertAvailable(secureStorageCallback))
                    secureStorageCallback(value);
            }).catch(()=>{
                console.log('Secure Storage failed!');
                if(Utils.assertAvailable(secureStorageCallback))
                    secureStorageCallback(null);
            });
        }
        else{
            if(Utils.assertAvailable(secureStorageCallback))
                secureStorageCallback(null);
        }
    }


    /** Set data - localStorage
     * @param key  key
     * @param callback
     * @param value  value*/
    static set(key:string, value:any, callback?: (status: boolean) => any)  {
        if (this.sessionManager.storage !=null){
            this.sessionManager.storage.set(key, value)
                .then(() => {
                    if (Utils.assertAvailable(callback))callback(true);
                })
                .catch(() => {
                    if (Utils.assertAvailable(callback))callback(false);
                });
        }
        else {
            if (typeof value === "object"){
                localStorage.setItem(key,Utils.toJson(value));
                if (Utils.assertAvailable(callback))callback(true);
            }
            else{
                localStorage.setItem(key,value);
                if (Utils.assertAvailable(callback))callback(true);
            }
        }
    }

    /** Get data - localStorage
     * @param key  key
     * @param callback
     * */
    static get(key:string, callback:(data:any)=>any){
        if (this.sessionManager.storage !=null){
            this.sessionManager.storage.get(key)
                .then(value => {
                    callback(value);
                })
                .catch((error) => {
                    console.log(error);
                    callback(null);
                });
        }
        else {
            let value = localStorage.getItem(key);
            let obj = Utils.parseJson(value);
            if (Utils.assertAvailable(obj)){
                callback(obj);
            }
            else{
                callback(value);
            }
        }
    }

    /** Remove data - localStorage
     * @param key  string
     * */
    static remove(key) {
        if (this.sessionManager.storage !=null){
            this.sessionManager.storage.remove(key);
        }
        else {
            localStorage.removeItem(key);
        }
    }

    /** Remove all data - localStorage
     * */
    static clear(){
        if (this.sessionManager.storage !=null){
            this.sessionManager.storage.clear();
        }
        localStorage.clear();
    }


    /** Get User Info from session
     * @param callback
     * */
    static getUserInfo(callback: (data: UserInfo) => any) {
        return this.get(this.user_info,callback)
    }

    /**Save User info to session
     * @param user
     * @param callback
     * */
    static setUserInfo(user: UserInfo, callback?: (status: boolean) => any) {
        this.set(this.user_info, user,callback)
    }

    /**Get Session Token
     * @param callback
     * */
    static getSession(callback: (data: ValidateSessionObject) => any) {
        return this.get(this.session_info,callback);
    }

    /**Set Session Token
     * @param session
     * @param callback
     * */
    static setSession(session: ValidateSessionObject, callback?: (status: boolean) => any) {
        this.set(this.session_info, session, callback);
    }

    /**
     * Logout user
     * @param redirectUri 
     */
    static async logout(redirectUri?:string) {
        this.clear();
        this.context.authorized = false;
        await this.context.goToLogin(redirectUri?{queryParams:{redirectUri: redirectUri}}:{});
        if (!this.context.loaded) {
            this.context.hideLoadingScreen();
        }
    }
}