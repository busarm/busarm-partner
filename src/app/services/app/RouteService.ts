import { Injectable } from "@angular/core";
import { Params, Router, UrlTree } from "@angular/router";
import { Platform, NavController } from "@ionic/angular";
import { NavigationOptions } from "@ionic/angular/providers/nav-controller";
import { SessionService } from "./SessionService";
import { Utils } from "../../helpers/Utils";
import { MD5 } from "crypto-js";

@Injectable({
  providedIn: "root",
})
export class RouteService {
  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public router: Router,
    private sessionService: SessionService
  ) {}

  /**Set RootPage*/
  public async setRootPage(
    url: string | UrlTree | any[],
    options?: NavigationOptions
  ) {
    options = options || {};
    options.replaceUrl = true;
    await this.navCtrl
      .navigateRoot(url, options)
      .then((value) => {
        return value;
      })
      .catch((err) => {
        return this.navCtrl.navigateRoot("home", options);
      });
  }

  /**
   * Navigate to a new page
   * @param path
   * @param params
   */
   public async navigate(path: string, params?: any) {
    if (params) {
      await this.setRouteParams(path, params);
    }
    return this.router.navigateByUrl(path);
  }

  /**Set RootPage to home page*/
  public async goHome(options?: NavigationOptions) {
    await this.setRootPage("home", options);
  }

  /**Set RootPage to login page*/
  public async goToLogin(options?: NavigationOptions) {
    await this.setRootPage("login", options);
  }

  /**
   * Set Route Params
   * @param path
   * @param params
   */
  public async setRouteParams(path: string, params: any) {
    return this.sessionService.set(await this.getRouteKey(path), params);
  }

  /**
   * Clear Route Params
   * @param path
   */
   public async clearRouteParams(path?: string) {
    return this.sessionService.remove(await this.getRouteKey(path));
  }

  /**
   * Get Route params
   * @param path
   */
  public async getRouteParams(path?: string) {
    return  this.sessionService.get(await this.getRouteKey(path));
  }

  /**
   * Get Route params
   * @param path
   */
  public async getRouteKey(path?: string) {
    return new Promise<any>((resolve: (data: any) => any) => {
      resolve(
        MD5(
          "route_" +
            Utils.safeString(
              (path ? path : this.router.url).replace("/", "")
            )
        ).toString()
      );
    });
  }

  /**
   * Get Url Query params
   */
  public async getQueryParams() {
    return await new Promise<Params>((resolve: (data: Params) => any) => {
      this.router.routerState.root.queryParams.subscribe(
        async (queryParams) => {
          if (queryParams) {
            resolve(queryParams);
          } else {
            resolve(null);
          }
        }
      );
    });
  }
}
