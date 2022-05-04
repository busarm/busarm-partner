import {
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { SwUpdate } from "@angular/service-worker";
import { NavigationStart, Router } from "@angular/router";
import {
  ActionSheetController,
  IonRouterOutlet,
  MenuController,
  ModalController,
  Platform,
  PopoverController,
} from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { Storage } from "@ionic/storage";

import { NetworkProvider } from "./services/app/NetworkProvider";
import { SessionService } from "./services/app/SessionService";
import { Urls } from "./helpers/Urls";
import { Strings } from "./resources";
import { ENVIRONMENT } from "../environments/environment";
import { Events } from "./services/app/Events";
import { ENV } from "../environments/ENV";
import { AuthService } from "./services/app/AuthService";
import { RouteService } from "./services/app/RouteService";
import { AlertService } from "./services/app/AlertService";
@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
})
export class AppComponent {
  /**Get app instance*/
  public static get instance(): AppComponent {
    return AppComponent._instance;
  }
  private static _instance: AppComponent;

  @ViewChild("loaderDiv") loadingScreen: ElementRef;
  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;

  public strings = Strings;

  /*Defines whether or not
    the app has been completed loading or not*/
  public showEnvironmentBanner = ENVIRONMENT != ENV.PROD;

  /*Defines whether or not
    the app has been completed loading or not*/
  public loaded = false;

  /*Current Navigated Page*/
  public currentPage: { id: number; url: string } = null;

  constructor(
    private swUpdate: SwUpdate,
    public platform: Platform,
    public router: Router,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    public modalCtrl: ModalController,
    private menu: MenuController,
    private actionSheetCtrl: ActionSheetController,
    private popoverCtrl: PopoverController,
    public events: Events,
    public storage: Storage,
    public networkProvider: NetworkProvider,
    public authService: AuthService,
    public routeService: RouteService,
    public alertService: AlertService,
    public sessionService: SessionService
  ) {
    AppComponent._instance = this;

    // Subscribe to network change event
    this.events.networkChanged.asObservable().subscribe((online) => {
      if (online) {
        this.alertService.hideToastMsg();
      } else {
        this.alertService.showNotConnectedMsg();
      }
    });

    // Subsrcibe to access & logout event
    this.events.logoutTriggered.subscribe((loggedOut) => {
      if (loggedOut && !this.loaded) {
        this.hideLoadingScreen();
      }
    });
    this.events.accessGranted.subscribe((granted) => {
      if (granted && !this.loaded) {
        this.hideLoadingScreen();
      }
    });

    // Set up dark mode using system setting if not signed in
    let systemDark = window.matchMedia("(prefers-color-scheme: dark)");
    this.authService.isAuthorize().then(async (authorized) => {
      if (!authorized) {
        await sessionService.setDarkMode(systemDark.matches);
        document.body.classList.toggle("dark", systemDark.matches);
      } else {
        document.body.classList.toggle("dark", (await sessionService.getDarkMode()));
      }
    }).catch (async () => {
      document.body.classList.toggle("dark", (await sessionService.getDarkMode()));
    });

    // Listen to system changes
    systemDark.onchange = (sys) => {
      this.authService.isAuthorize().then((authorized) => {
        if (!authorized) {
          sessionService.setDarkMode(sys.matches);
          document.body.classList.toggle("dark", sys.matches);
          events.darkModeChanged.next(sys.matches);
        }
      }).catch (() => {
        sessionService.setDarkMode(sys.matches);
        document.body.classList.toggle("dark", sys.matches);
        events.darkModeChanged.next(sys.matches);
      });;
    };

    // Subscribe to any updates
    this.subscribeToUpdates();

    // All set ready to go
    platform.ready().then(async () => {
      // Register Back button event
      this.registerPopStateChanged();

      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      // Start network change events
      this.networkProvider.initializeNetworkEvents();
    });
  }

  /**Get app environment*/
  get environment() {
    return ENVIRONMENT;
  }

  /**Get live url*/
  get liveUrl(): String {
    return Urls.baseUrl(ENV.PROD);
  }

  /**Subscribe to any updates */
  private subscribeToUpdates(): void {
    if (this.swUpdate.available) {
      this.swUpdate.available.subscribe(() => {
        this.alertService.showAlert(
          Strings.getString("update_available_title"),
          Strings.getString("update_available_msg"),
          {
            title: Strings.getString("no_txt"),
          },
          {
            title: Strings.getString("yes_txt"),
            callback: () => {
              window.location.reload();
            },
          }
        );
      });
    }
  }

  /**
   * Register Pop State changes
   */
  public registerPopStateChanged() {
    if (this.platform.is("cordova") || this.platform.is("capacitor")) {
      // Back button press listner - before action
      this.platform.backButton.subscribe(async () => {
        await this.processPopState(true);
      });
    } else {
      // Popstate Event - after action
      this.router.events.subscribe((value) => {
        if (value instanceof NavigationStart) {
          this.currentPage = {
            id: value.id,
            url: value.url,
          };
        }
      });
      window.addEventListener("popstate", async (e) => {
        if (e.state != null && typeof e.state != "undefined") {
          await this.processPopState(false, e.state, this.currentPage);
        }
      });
    }
  }

  /**Process Pop State changes
   * @param backPressed
   * @param state
   * @param currentPage
   * @return {Promise<void>}
   */
  private async processPopState(
    backPressed?: boolean,
    state?: { navigationId: number },
    currentPage?: { id: number; url: string }
  ): Promise<void> {
    // close action sheet
    if (this.actionSheetCtrl) {
      try {
        const element = await this.actionSheetCtrl.getTop();
        if (element) {
          await element.dismiss();
          if (!backPressed && state && state.navigationId !== currentPage.id) {
            await this.router.navigateByUrl(currentPage.url);
          }
          return;
        }
      } catch (error) {}
    }

    // close popover
    if (this.popoverCtrl) {
      try {
        const element = await this.popoverCtrl.getTop();
        if (element) {
          await element.dismiss();
          if (!backPressed && state && state.navigationId !== currentPage.id) {
            await this.router.navigateByUrl(currentPage.url);
          }
          return;
        }
      } catch (error) {}
    }

    // close modal
    if (this.modalCtrl) {
      try {
        const element = await this.modalCtrl.getTop();
        if (element) {
          await element.dismiss();
          if (!backPressed && state && state.navigationId !== currentPage.id) {
            await this.router.navigateByUrl(currentPage.url);
          }
          return;
        }
      } catch (error) {}
    }

    // close side menu
    if (this.menu) {
      try {
        const element = await this.menu.getOpen();
        if (element) {
          await this.menu.close();
          if (!backPressed && state && state.navigationId !== currentPage.id) {
            await this.router.navigateByUrl(currentPage.url);
          }
          return;
        }
      } catch (error) {}
    }

    // Go back
    if (backPressed && this.routerOutlets) {
      this.routerOutlets.forEach(async (outlet: IonRouterOutlet) => {
        if (outlet && outlet.canGoBack()) {
          await outlet.pop();
        }
      });
    }
  }

  /**Hide Initial Loading screen*/
  public hideLoadingScreen() {
    setTimeout(() => {
      this.loaded = true;
      this.loadingScreen.nativeElement.style.display = "none";
    }, 1000);
  }
}
