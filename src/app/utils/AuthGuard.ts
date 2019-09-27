import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from "@angular/router";
import {Injectable} from "@angular/core";
import {AppComponent} from "../app.component";
import {LoginPage} from "../page/login/login.page";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor() {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (!AppComponent.instance.loaded && !AppComponent.instance.authAttempted) {
            return AppComponent.instance.authorize(!AppComponent.instance.authorized).then(status => {
                if (route.component == LoginPage){
                    if (status) {
                        AppComponent.instance.setRootPage('/home');
                    }
                    return !status;
                }
                return status;
            })
        } else {
            if (route.component == LoginPage){
                if (AppComponent.instance.authorized){
                    AppComponent.instance.setRootPage('/home');
                }
                return !AppComponent.instance.authorized;
            }
            return AppComponent.instance.authorized;
        }
    }
}