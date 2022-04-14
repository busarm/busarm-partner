import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
} from "@angular/router";
import { Injectable } from "@angular/core";
import { ToastType } from "../../helpers/Utils";
import { Strings } from "../../resources";
import { AuthService } from "../app/AuthService";
import { RouteService } from "../app/RouteService";
import { AlertService } from "../app/AlertService";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    public authService: AuthService,
    public routeService: RouteService,
    public alertService: AlertService
  ) {}
  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return await this.authService
      .authorize()
      .then((status) => {
        if (route.routeConfig.path === "login") {
          // If login page, go to home if already authorized
          if (status) {
            this.routeService.goHome();
          } else {
            this.authService.logout(false, route.routeConfig.path);
          }
          return !status;
        } else {
          if (!status) {
            this.alertService.showToastMsg(
              Strings.getString("error_access_expired"),
              ToastType.ERROR
            );
            this.authService.logout(true, route.routeConfig.path);
          }
          return status;
        }
      })
      .catch((err) => {
        this.alertService.showToastMsg(
          err || Strings.getString("error_unexpected"),
          ToastType.ERROR
        );

        if (route.routeConfig.path === "login") {
          this.authService.logout(false, route.routeConfig.path);
          return true;
        }
        return false;
      });
  }
}
