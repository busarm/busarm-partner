import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from "@angular/router";
import {Injectable} from "@angular/core";
import {AppComponent} from "../app.component";
import { ToastType } from "./Utils";
import { SessionManager } from "./SessionManager";
import { Strings } from "../resources";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor() {}
    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return await AppComponent.instance.authorize(!AppComponent.instance.authAttempted).then(async status => {
            if (route.routeConfig.path === 'login') { // If login page, go to home if already authorized
                if (status) {
                    await AppComponent.instance.goHome();
                }
                return !status;
            } else {
                if (!status) {
                   await AppComponent.instance.showToastMsg(Strings.getString('error_access_expired'), ToastType.ERROR);
                   await SessionManager.logout(route.routeConfig.path);
                }
                return status;
            }
        }) ;
    }
}
