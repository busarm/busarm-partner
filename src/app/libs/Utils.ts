import * as CryptoJS from "crypto-js";
import { Urls } from "./Urls"; 
import { NetworkProvider } from "../services/NetworkProvider"; 
import { ENVIRONMENT } from "../../environments/environment";
import { ENV } from "../../environments/ENV";

/**This hold Global Javascript functions
 * which you want to be accessible
 * globally through the app
 * */

export class Utils {

    /**Return url without it's url parameters
     * @param url Url to strip
     * @return string
     * */
    static stripUrlParams(url: string) {
        if (Utils.assertAvailable(url)) {
            return url.split("?")[0];
        }
        else
            return url;
    }

    /**Mask String
     * */
    static mask(str: any, show_count:number = 5, with_char: string = 'x'){
        return str.substring(0, show_count)+new Array(str.length - show_count).join(with_char);
    }

    /**Return Current Instance hash
     * */
    static async getCurrentInstance() {
        return await new Promise(async (resolve:((data:string)=>any)) => {
            let date = new Date();
            let ipAddress = ENVIRONMENT !== ENV.DEV? await Utils.getIP() : false;
            resolve(String(CryptoJS.MD5(
                Utils.harold(date.getHours()) + "-" +
                Utils.harold(date.getDay()) + "-" +
                Utils.harold(date.getMonth()) + "-" +
                Utils.harold(date.getFullYear())))+
                "/"+
                String(CryptoJS.SHA256((ipAddress?ipAddress:location.host))));
        });
    }

    

    /**Return Current IP
     * */
    static async getIP() {
        return await new Promise(async (resolve:((data:any)=>any))=> {
            NetworkProvider.getInstance().httpClient.get("https://ip-api.com/json")
            .subscribe((data:any) => {
                resolve(data.query);
            }, () => {
                resolve(false);
            });
        });
    }

    /**Pares Html entities*/
    static convertHTMLEntity(text){
        const span = document.createElement('span');
        return text
            .replace(/&[#A-Za-z0-9]+;/gi, (entity,position,text)=> {
                span.innerHTML = entity;
                return span.innerText;
            });
    }

    /**Load Google Api*/
    static loadGoogleApi(key:string){
        Utils.load_script(Urls.googleApiUrl.replace("<key>",key))
    }


    /**Get hash of string
     * @param str string
     * */
    static hashString (str){
        str = str.trim();
        let hash = 0, i = 0, len = str.length;
        while ( i < len ) {
            hash  = ((hash << 5) - hash + str.charCodeAt(i++)) << 0;
        }
        return Math.abs(hash);
    }

    /**Load Javascript files
     * @param url SCRIPT URL
     * @param callback function Callback
     * */
    static load_script(url:string|string[]|any, callback?) {
        if (typeof url === 'string') {
            attach(url, callback);
        }
        else if (typeof url === 'object' || (url.prop && url.prop.constructor === Array) || url instanceof Array) {
            let count = Utils.count(url);
            let loopUrl = (key, url) => {
                if (url.hasOwnProperty(key)) {
                    if (url[key] !== null && typeof url[key] !== 'undefined') {
                        attach(url[key], () => {
                            if (parseInt(key) === count - 1)
                                if (Utils.assertAvailable(callback)) {
                                    callback();
                                }
                            else
                                loopUrl(key + 1, url);
                        });
                    }
                }
            };

            /*Start loop
            * This kind of loop
            * is to make sure that the
            * items are attached synchronously
            * especially for scripts where
            * the later script may depend on the initial
            * and hence the initial has to be loaded first*/
            loopUrl(0, url);
        }

        /**Attach script
         * @param url string
         * @param callback function
         */
        function attach(url, callback) {

            /*Remove if exists previously*/
            let hash = Utils.hashString(url);
            let s = document.getElementById(String(hash));
            if (Utils.assertAvailable(s)) {
                s.remove();
            }
            let script:HTMLScriptElement = document.createElement('script');
            script.type = "application/javascript";
            script.id = String(hash);
            document.head.appendChild(script);
            script.onload = function () {
                if (Utils.assertAvailable(callback)) {
                    callback();
                }
            };
            script.src = url;
        }
    }

    /**get Harold number*/
    static harold(standIn) {
        if (standIn < 10) {
            standIn = '0' + standIn;
        }
        return standIn;
    }

    /**Delete all data from an
     * object and return the empty object
     * without loosing the reference
     * */
    static emptyObject(object: object) {
        // for all properties of shallow/plain object
        for (let key in object) {
            if (object.hasOwnProperty(key)) {
                delete object[key];
            }
        }
    }

    /**Check if collection contains data
     *  @param object object
     *  @param itemKey string
     *  @return boolean*/
    static objectContains(object: object, itemKey: string): boolean {
        for (let key in object) {
            if (object.hasOwnProperty(key)) {
                if (Utils.assertAvailable(object[key])) {
                    if (key === itemKey)
                        return true;
                }
            }
        }

        return false;
    }

    /**Get a safe form of stIntring to store,
     * eliminating null and 'undefined'
     * @param item
     *  @return number
     *  */
    static safeInt(item): number {
        if (Utils.assertAvailable(item)) {
            return item;
        }
        return 0;
    }


    /**Check if item is nut null, undefined or empty
     * eliminating null and 'undefined'
     * @param item
     *  @return boolean
     *  */
    static assertAvailable(item: any): boolean {
        return item != null && typeof item !== 'undefined' && item !== "";
    }


    /** Parse Json string to object
     *  @param json string
     *  @return object
     *  */
    static parseJson(json: string): object | any {
        let result = null;
        try {
            result = JSON.parse(json);
        }
        catch (e) {
        }
        return result;

    }


    /** Parse Json obj to string
     *  @param obj  object
     *  @return string
     *  */
    static toJson(obj: any): string {
        let result = "";
        try {
            result = JSON.stringify(obj);
        }
        catch (e) {
            console.log(e);
        }

        return result;
    }

    /**Merge Object with another*/
    static mergeObj(obj: object, src: object) {
        for (let key in src) {
            if (src.hasOwnProperty(key)) {
                if (Array.isArray(obj)) //If array
                {
                    obj.push(src[key]);
                }
                else //object
                {
                    obj[Utils.count(obj)] = src[key];
                }
            }
        }
        return obj;
    }

    /**Url encode objects*
     * @param myData object
     */
    static urlEncodeObjects(myData: object): string {

        let encodeObj = function (data, key, parent) {
            let encoded = [];
            for (let subKey in data[key]) {
                if (data[key].hasOwnProperty(subKey)) {
                    if (data[key][subKey] !== null && typeof data[key][subKey] !== 'undefined') {
                        if (typeof data[key][subKey] === 'object' || Array.isArray(data[key][subKey])) { //If object or array
                            let newParent = parent + '[' + subKey + ']';
                            Utils.mergeObj(encoded, encodeObj(data[key], subKey, newParent));
                        }
                        else {
                            encoded.push(encodeURIComponent(parent + '[' + subKey + ']') + '=' + encodeURIComponent(data[key][subKey]));
                        }
                    }
                }
            }
            return encoded;
        };

        let encodeData = function (data) {
            let encoded = [];
            if (data !== null && typeof data === 'object') {
                for (let key in data) {
                    if (data.hasOwnProperty(key)) {
                        if (data[key] !== null && typeof data[key] !== 'undefined') {
                            if (typeof data[key] === 'object' || Array.isArray(data[key])) { //If object or array
                                Utils.mergeObj(encoded, encodeObj(data, key, key));
                            }
                            else {
                                encoded.push(key + '=' + encodeURIComponent(data[key]));
                            }
                        }
                    }
                }
            }
            return encoded;
        };

        let out = encodeData(myData);
        if (out.length > 0) {
            return out.join('&');
        }
        else {
            return "";
        }
    }

    /**Count Object array
     * @return int*/
    static count(obj: object): number {
        let element_count = 0;
        for (let e in obj) {
            if (obj.hasOwnProperty(e))
                element_count++;
        }
        return element_count;
    }

    /**Create safe string*
     * That can be passed and saved in DB
     * @param str
     * @return string
     */
    static safeString(str: string): string {
        if (str !== null && typeof str !== 'undefined' && str !== "") {
            return str
                .trim()
                .replace(/[<>\/!#$%^&*~`,'"\[\]\\|{}]/gi, "");
        }
        else {
            return "";
        }
    }
}


/**Define Type of toast message*/
export enum ToastType {
    WARNING = "toast-warning",
    ERROR = "toast-error",
    SUCCESS = "toast-success",
    NORMAL = "toast-normal"
}