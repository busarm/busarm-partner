import * as CryptoJS from "crypto-js";
import { Urls } from "./Urls";
import { PingResponse } from "../models/PingResponse";

/**This hold Global Javascript functions
 * which you want to be accessible
 * globally through the app
 * */

export class Utils {

  /**
   * Number formatter
   * @param {number} num
   * @param {number} declimals
   * @returns {string}
   */
   static nFormatter(num: number, declimals: number = 1): string {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(declimals).replace(/\.0$/, "") + "B";
    }
    else if (num >= 1000000) {
      return (num / 1000000).toFixed(declimals).replace(/\.0$/, "") + "M";
    }
    else if (num >= 1000) {
      return (num / 1000).toFixed(declimals).replace(/\.0$/, "") + "K";
    }
    return String(num);
  }

  /** Parse Float
   * @param str
   * @return number
   * */
  static parseFloat(str: any) {
    try {
      return parseFloat(str);
    } catch (error) {
      return 0;
    }
  }

  /** Parse Float
   * @param str
   * @return number
   * */
  static parseInt(str: any) {
    try {
      return parseInt(str);
    } catch (error) {
      return 0;
    }
  }

  /**Return url without it's url parameters
   * @param url Url to strip
   * @return string
   * */
  static stripUrlParams(url: string) {
    if (Utils.assertAvailable(url)) {
      return url.split("?")[0];
    } else return url;
  }

  /**Mask String
   * */
  static mask(str: any, show_count: number = 5, with_char: string = "x") {
    return (
      str.substring(0, show_count) +
      new Array(str.length - show_count).join(with_char)
    );
  }

  /**Return Current Signature
   * */
  static getCurrentSignature(ping: PingResponse) {
    let date = new Date();
    let ip = ping ? ping.ip : "";
    return String(
      CryptoJS.MD5(
        Utils.harold(date.getDay()) +
        "-" +
        Utils.harold(date.getMonth()) +
        "-" +
        Utils.harold(date.getFullYear()) +
        "|" +
        ip +
        "|" +
        location.host
      )
    );
  }

  /**Pares Html entities*/
  static convertHTMLEntity(text: string) {
    const span = document.createElement("span");
    return text.replace(
      /&[#A-Za-z0-9]+;/gi,
      (entity: any, position: any, text: any) => {
        span.innerHTML = entity;
        return span.innerText;
      }
    );
  }

  /**Load Google Api*/
  static async loadGoogleApi(key: string) {
    await Utils.loadScript(Urls.googleApiUrl.replace("<key>", key),);
  }

  /**Get hash of string
   * @param str string
   * */
  static hashString(str) {
    str = str.trim();
    let hash = 0,
      i = 0,
      len = str.length;
    while (i < len) {
      hash = ((hash << 5) - hash + str.charCodeAt(i++)) << 0;
    }
    return Math.abs(hash);
  }

  /**Load Javascript files
   * @param url script URL
   * @returns {Promise}
   * */
  static async loadScript(url: string | string[] | any): Promise<any> {
    if (!url || url === "" || url.length < 1) {
      return;
    }

    /**Attach script
     * @param url string
     */
    let attach = (url: string) => {
      return new Promise((resolve) => {
        /*Remove if exists previously*/
        let hash = String(Utils.hashString(url));
        let el = document.getElementById(hash);
        if (Utils.assertAvailable(el)) {
          el.remove();
        }
        let script: HTMLScriptElement = document.createElement("script");
        script.type = "application/javascript";
        script.async = true;
        script.id = hash;
        document.body.appendChild(script);
        script.onload = function () {
          resolve(true);
        };
        script.src = url;
      });
    };

    if (typeof url === "string") {
      return attach(url);
    } else if (
      typeof url === "object" ||
      (url.prop && url.prop.constructor === Array) ||
      url instanceof Array
    ) {
      let promises = url.map(url, function (value) {
        return attach(value);
      });
      return Promise.all(promises);
    } else {
      return Promise.reject("Invalid script");
    }
  }

  /**get Harold number*/
  static harold(standIn) {
    if (standIn < 10) {
      standIn = "0" + standIn;
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
          if (key === itemKey) return true;
        }
      }
    }

    return false;
  }

  /**Get a safe form of Int to store,
   * eliminating null and 'undefined'
   * @param item
   * @return number
   *  */
  static safeInt(item): number {
    if (Utils.assertAvailable(item)) {
      try {
        return parseInt(item);
      } catch (error) {
        console.log(error);
        return 0;
      }
    }
    return 0;
  }

  /**Get a safe form of Float to store,
   * eliminating null and 'undefined'
   * @param item
   * @return number
   *  */
  static safeFloat(item: any): number {
    if (Utils.assertAvailable(item)) {
      try {
        return parseFloat(item);
      } catch (error) {
        console.log(error);
        return 0;
      }
    }
    return 0;
  }

  /**Check if item is nut null, undefined or empty
   * eliminating null and 'undefined'
   * @param item
   *  @return boolean
   *  */
  static assertAvailable(item: any): boolean {
    return typeof item !== "undefined" && item != null && item !== "";
  }

  /** Parse Json string to object
   *  @param json string
   *  @return object
   *  */
  static parseJson(json: string): object | any {
    let result = null;
    try {
      result = JSON.parse(json);
    } catch (e) { }
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
    } catch (e) {
      console.log(e);
    }

    return result;
  }

  /**Merge Object with another*/
  static mergeObj(obj: object, src: object) {
    for (let key in src) {
      if (src.hasOwnProperty(key)) {
        if (Array.isArray(obj)) {
          //If array
          obj.push(src[key]);
        } //object
        else {
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
          if (
            data[key][subKey] !== null &&
            typeof data[key][subKey] !== "undefined"
          ) {
            if (
              typeof data[key][subKey] === "object" ||
              Array.isArray(data[key][subKey])
            ) {
              //If object or array
              let newParent = parent + "[" + subKey + "]";
              Utils.mergeObj(encoded, encodeObj(data[key], subKey, newParent));
            } else {
              encoded.push(
                encodeURIComponent(parent + "[" + subKey + "]") +
                "=" +
                encodeURIComponent(data[key][subKey])
              );
            }
          }
        }
      }
      return encoded;
    };

    let encodeData = function (data) {
      let encoded = [];
      if (data !== null && typeof data === "object") {
        for (let key in data) {
          if (data.hasOwnProperty(key)) {
            if (data[key] !== null && typeof data[key] !== "undefined") {
              if (typeof data[key] === "object" || Array.isArray(data[key])) {
                //If object or array
                Utils.mergeObj(encoded, encodeObj(data, key, key));
              } else {
                encoded.push(key + "=" + encodeURIComponent(data[key]));
              }
            }
          }
        }
      }
      return encoded;
    };

    let out = encodeData(myData);
    if (out.length > 0) {
      return out.join("&");
    } else {
      return "";
    }
  }

  /**Count Object array
   * @return int*/
  static count(obj: object): number {
    let element_count = 0;
    for (let e in obj) {
      if (obj.hasOwnProperty(e)) element_count++;
    }
    return element_count;
  }

  /**Create safe string*
   * That can be passed and saved in DB
   * @param str
   * @return string
   */
  static safeString(str: string): string {
    if (str !== null && typeof str !== "undefined" && str !== "") {
      return str.trim().replace(/[<>\/!#$%^&*~`,'"\[\]\\|{}]/gi, "");
    } else {
      return "";
    }
  }

  /**
   * Convert date timezone
   *
   * @param date
   * @param tz
   * @param locale
   * @returns
   */
  static convertTZ(date: Date | string, tz: string, locale: string = null) {
    return new Date(
      (typeof date === "string" ? new Date(date) : date).toLocaleString(
        locale || "en-US",
        { timeZone: tz }
      )
    );
  }

  /**
   * Returns a date set to the begining of the month
   *
   * @param {Date|String} myDate
   * @param {string} utc
   * @returns {Date}
   */
  static beginningOfMonth(myDate: Date | string, tz: string = null): Date {
    tz = tz || "UTC";
    let date = Utils.convertTZ(myDate, tz);
    date.setDate(1);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    return date;
  }

  /**
   * Returns a date set to the end of the month
   *
   * @param {Date|String} myDate
   * @param {string} utc
   * @returns {Date}
   */
  static endOfMonth(myDate: Date | string, tz: string = null): Date {
    tz = tz || "UTC";
    let date = Utils.convertTZ(myDate, tz);
    date.setDate(1); // Avoids edge cases on the 31st day of some months
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    date.setHours(23);
    date.setMinutes(59);
    date.setSeconds(59);
    return date;
  }
}

/**Define Type of toast message*/
export enum ToastType {
  WARNING = "toast-warning",
  ERROR = "toast-error",
  SUCCESS = "toast-success",
  NORMAL = "toast-normal",
}
