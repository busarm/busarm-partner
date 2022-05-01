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
import { Events } from "../app/Events";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    public events: Events,
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
            // Trigger access granted event
            this.events.accessGranted.next(true);
            return false; // 'false' not permit showing login page - go to home rather
          } else {
            // Trigger logout event
            this.events.logoutTriggered.next(true);
            return true; // 'true' permit showing login page
          }
        } else {
          if (!status) {
            this.alertService.showToastMsg(
              Strings.getString("error_access_expired"),
              ToastType.ERROR
            );
            this.authService.logout(true, route.routeConfig.path);
            return false;
          }
          // Trigger access granted event
          this.events.accessGranted.next(true);
          return true;
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
