/**
 * Use this class to manage
 * the all data stored in the session
 * */
import { Injectable } from "@angular/core";
import { User } from "../../models/User/User";
import { PingResponse } from "../../models/PingResponse";
import { Session } from "../../models/Session";
import { Utils } from "../../helpers/Utils";
import { Storage } from "@ionic/storage";

@Injectable({
  providedIn: "root",
})
export class SessionService {
  /**Get app instance*/
  public static get instance(): SessionService {
    return SessionService._instance;
  }
  private static _instance: SessionService;

  private memoize = {};

  constructor(private storage: Storage) {
    SessionService._instance = this;
  }

  /** Set data - localStorage
   * @param key  key
   * @param callback
   * @param value  value
   * @return Promise if no callback given
   * */
  async set(
    key: string,
    value: any,
    callback?: (status: boolean) => any
  ): Promise<boolean> {
    if (this.storage != null) {
      try {
        await this.storage
          .set(key, value)
          .then(() => (this.memoize[key] = value));
        if (Utils.assertAvailable(callback)) callback(true);
        return true;
      } catch {
        if (Utils.assertAvailable(callback)) callback(false);
        return false;
      }
    } else {
      return new Promise((resolve) => {
        this.memoize[key] = value;
        if (typeof value === "object")
          localStorage.setItem(key, Utils.toJson(value));
        else localStorage.setItem(key, value);

        if (Utils.assertAvailable(callback)) callback(true);
        resolve(true);
      });
    }
  }

  /** Get data - localStorage
   * @param key  key
   * @param callback
   * @return Promise if no callback given
   * */
  async get(key: string, callback?: (data: any) => any): Promise<any> {
    if (this.storage != null) {
      try {
        const value = this.memoize[key]
          ? this.memoize[key]
          : await this.storage.get(key);
        this.memoize[key] = value; // mem cache
        if (Utils.assertAvailable(callback)) callback(value);
        return value;
      } catch {
        if (Utils.assertAvailable(callback)) callback(null);
        return null;
      }
    } else {
      return new Promise((resolve) => {
        let value = this.memoize[key]
          ? this.memoize[key]
          : localStorage.getItem(key);
        this.memoize[key] = value; // mem cache
        let obj = Utils.parseJson(value);
        if (Utils.assertAvailable(callback))
          callback(Utils.assertAvailable(obj) ? obj : value);
        resolve(Utils.assertAvailable(obj) ? obj : value);
      });
    }
  }

  /** Remove data - localStorage
   * @param key  string
   * */
  async remove(key: string): Promise<any> {
    if (this.storage != null) {
      delete this.memoize[key];
      return this.storage.remove(key);
    } else {
      return new Promise((resolve) => {
        delete this.memoize[key];
        localStorage.removeItem(key);
        resolve(true);
      });
    }
  }

  /** Remove all data - localStorage
   * */
  async clear(): Promise<any> {
    if (this.storage != null) {
      return this.storage.clear();
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
  getUserInfo(callback?: (data: User) => any): Promise<User> {
    if (Utils.assertAvailable(callback)) {
      return this.getSession((session) => {
        callback(session ? session.user : null);
      });
    } else {
      return new Promise<User>(async (resolve) => {
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
  setUserInfo(user: User, callback?: (status: boolean) => any) {
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
  getPing(callback?: (data: PingResponse) => any): Promise<PingResponse> {
    return this.get(SessionKeys.PING, callback);
  }

  /**Save Ping Data to session
   * @param ping
   * @param callback
   * */
  setPing(ping: PingResponse, callback?: (status: boolean) => any) {
    return this.set(SessionKeys.PING, ping, callback);
  }

  /**Get Session Token
   * @param callback
   * */
  getSession(callback?: (data: Session) => any): Promise<Session> {
    return this.get(SessionKeys.SESSION_INFO, callback);
  }

  /**Set Session Token
   * @param session
   * @param callback
   * */
  setSession(session: Session, callback?: (status: boolean) => any) {
    return this.set(SessionKeys.SESSION_INFO, session, callback);
  }

  /** Get dark mode
   * @param callback
   * */
  getDarkMode(callback?: (status: boolean) => any): Promise<boolean> {
    return this.get(SessionKeys.DARK_MODE, callback);
  }

  /** Save dark mode
   * @param darkMode
   * @param callback
   * */
  setDarkMode(darkMode: boolean, callback?: (status: boolean) => any) {
    return this.set(SessionKeys.DARK_MODE, darkMode, callback);
  }
}

export enum SessionKeys {
  SESSION_INFO = "session_info",
  PING = "ping",
  DARK_MODE = "dark_mode",
}
