/**Use this class to manage
 * all Requests Urls
 * */
import {ENVIRONMENT, SERVER_IP} from "../../environments/environment";
import {ENV} from "../../environments/ENV";

export class Urls{

    /*Base Urls*/
    public static get baseUrl():string {
        switch (ENVIRONMENT){
            case ENV.PROD:
                return "https://ebusgh.com/";
            case ENV.TEST:
                return "http://"+SERVER_IP+"/ebusgh.com/";
            case ENV.DEV:
            default:
                return "http://localhost/ebusgh.com/";
        }
    }
    public static get appBaseUrl():string {
        switch (ENVIRONMENT){
            case ENV.PROD:
                return "https://app.ebusgh.com/";
            case ENV.TEST:
                return Urls.baseUrl + "site/";
            case ENV.DEV:
            default:
                return Urls.baseUrl + "site/";
        }
    };
    public static get apiBaseUrl():string {
        switch (ENVIRONMENT){
            case ENV.PROD:
                return "https://api.ebusgh.com/";
            case ENV.TEST:
                return Urls.baseUrl + "site/";
            case ENV.DEV:
            default:
                return Urls.baseUrl + "site/";
        }
    };
    public static get oauthBaseUrl():string {
        switch (ENVIRONMENT){
            case ENV.PROD:
                return "https://oauth.ebusgh.com/";
            case ENV.TEST:
                return Urls.baseUrl + "oauth/";
            case ENV.DEV:
            default:
                return Urls.baseUrl + "oauth/";
        }
    };

    public static pingUrl:string;
    public static oauthVerifyTokenUrl:string;
    public static oauthAuthorizeUrl:string;
    public static oauthTokenUrl:string;
    public static termsUrl:string;
    public static privacyUrl:string;
    public static support:string;
    public static apiValidateSession:string;
    public static apiLogout:string;
    public static apiUser:string;
    public static apiTrip:string;
    public static apiTrips:string;
    public static apiBus:string;
    public static apiBuses:string;
    public static apiTicket:string;
    public static apiTripBus:string;
    public static apiBusImage:string;
    public static apiGetDashboard:string;
    public static apiGetBookingInfo:string;
    public static apiVerifyBooking:string;
    public static apiGetPartnerBusTypes:string;
    public static apiGetBusTypes:string;
    public static apiGetTripsNewStatusList:string;
    public static apiGetTripsAllStatusList:string;
    public static apiGetLocationTypes:string;
    public static apiGetTicketTypes:string;
    public static apiUpdateTripStatus:string;
    public static apiUpdateTripBusType:string;
    public static apiUpdatePartnerLogo:string;
    public static apiGetAgents:string;
    public static apiAdmin:string;
    public static apiVerify:string;
    public static apiPayInRequest:string;
    public static apiPayoutRequest:string;


    /**Initialize Urls
     * */
    public static init(){

        /*Generic Urls*/
        this.pingUrl = Urls.baseUrl + "ping/";
        this.support = Urls.appBaseUrl + "support/";
        this.termsUrl = Urls.appBaseUrl + "terms/";
        this.privacyUrl = Urls.appBaseUrl + "privacy/";

        /*Oauth Urls*/
        this.oauthVerifyTokenUrl = Urls.oauthBaseUrl + "resources/verifyToken";
        this.oauthAuthorizeUrl = Urls.oauthBaseUrl + "authorize/request";
        this.oauthTokenUrl = Urls.oauthBaseUrl + "token/get";


        /*Api Urls*/
        this.apiValidateSession = Urls.apiBaseUrl + "access/validate";
        this.apiLogout = Urls.apiBaseUrl + "access/logout";
        this.apiUser = Urls.apiBaseUrl + "agent/User";
        this.apiGetBusTypes = Urls.apiBaseUrl + "app/Bus/types";
        this.apiGetTripsNewStatusList = Urls.apiBaseUrl + "app/Trip/newStatus";
        this.apiGetTripsAllStatusList = Urls.apiBaseUrl + "app/Trip/allStatus";
        this.apiGetLocationTypes = Urls.apiBaseUrl + "app/Location/types";
        this.apiGetTicketTypes = Urls.apiBaseUrl + "app/Ticket/types";
        this.apiTrip = Urls.apiBaseUrl + "agent/Trip";
        this.apiTrips = Urls.apiBaseUrl + "agent/Trip/list";
        this.apiTripBus = Urls.apiBaseUrl + "agent/Trip/bus";
        this.apiBus = Urls.apiBaseUrl + "agent/Bus";
        this.apiBuses = Urls.apiBaseUrl + "agent/Bus/list";
        this.apiBusImage = Urls.apiBaseUrl + "agent/Bus/image";
        this.apiTicket = Urls.apiBaseUrl + "agent/Ticket";
        this.apiGetDashboard = Urls.apiBaseUrl + "agent/common/dashboard";
        this.apiGetPartnerBusTypes = Urls.apiBaseUrl + "agent/Bus/types";
        this.apiGetBookingInfo = Urls.apiBaseUrl + "agent/Booking/info";
        this.apiVerifyBooking = Urls.apiBaseUrl + "agent/Booking/verify";
        this.apiUpdateTripStatus = Urls.apiBaseUrl + "agent/Trip/status";
        this.apiUpdateTripBusType = Urls.apiBaseUrl + "agent/Trip/busType";
        this.apiUpdatePartnerLogo = Urls.apiBaseUrl + "agent/User/logo";
        this.apiGetAgents = Urls.apiBaseUrl + "agent/User/list";
        this.apiAdmin = Urls.apiBaseUrl + "agent/User/admin";
        this.apiVerify = Urls.apiBaseUrl + "agent/User/verify";
        this.apiPayInRequest = Urls.apiBaseUrl + "agent/Transaction/payInRequest";
        this.apiPayoutRequest = Urls.apiBaseUrl + "agent/Transaction/payoutRequest";
    }
}