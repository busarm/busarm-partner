/**Use this class to manage
 * all Requests Urls
 * */
import {ENVIRONMENT} from "../../environments/environment";
import {ENV} from "../../environments/ENV";

export class Urls{

    /*Base Urls*/
    public static get appUrl():string {
        switch (ENVIRONMENT){
            case ENV.PROD:
                return "https://wecari.com/";
            case ENV.TEST:
                return "https://staging.wecari.com/";
            case ENV.DEV:
            default:
                return "http://localhost/";
        }
    }
    public static get apiBaseUrl():string {
        switch (ENVIRONMENT){
            case ENV.PROD:
                return "https://api.wecari.com/";
            case ENV.TEST:
                return "https://api.staging.wecari.com/";
            case ENV.DEV:
            default:
                return "http://localhost:8080/";
        }
    };
    public static get oauthBaseUrl():string {
        switch (ENVIRONMENT){
            case ENV.PROD:
                return "https://oauth.wecari.com/";
            case ENV.TEST:
                return "https://oauth.staging.wecari.com/";
            case ENV.DEV:
            default:
                return "http://localhost:8000/";
        }
    };
    public static get baseUrl():string {
        switch (ENVIRONMENT){
            case ENV.PROD:
                return "https://partner.wecari.com/";
            case ENV.TEST:
                return "https://partner.staging.wecari.com/";
            case ENV.DEV:
            default:
                return "http://localhost:8100/";
        }
    };

    public static pingUrl:string;
    public static partnerOauthRedirectUrl:string;
    public static oauthVerifyTokenUrl:string;
    public static oauthAuthorizeUrl:string;
    public static oauthTokenUrl:string;
    public static termsUrl:string;
    public static privacyUrl:string;
    public static support:string;
    public static apiInitialize:string;
    public static apiLanguage:string;
    public static apiCountry:string;
    public static apiLogout:string;
    public static apiUser:string;
    public static apiUserToggle:string;
    public static apiTrip:string;
    public static apiTrips:string;
    public static apiBus:string;
    public static apiBuses:string;
    public static apiTicket:string;
    public static apiTicketToggle:string;
    public static apiTripBus:string;
    public static apiTripReserve:string;
    public static apiBusImage:string;
    public static apiBusShare:string;
    public static apiGetDashboard:string;
    public static apiGetBookings:string;
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
    public static apiGetPayin:string;
    public static apiGetPayout:string;
    public static apiGetBanks:string;
    public static apiPayInRequest:string;
    public static apiPayoutRequest:string;
    public static googleApiUrl:string;
    public static apiLocation:string;
    public static apiLocations:string;

    /**Initialize Urls
     * */
    public static init(){

        /*Generic Urls*/
        this.support = Urls.appUrl + "support/";
        this.termsUrl = Urls.appUrl + "terms/";
        this.privacyUrl = Urls.appUrl + "privacy/";
        this.partnerOauthRedirectUrl = Urls.baseUrl + "hooks/oauth/authorize"

        /*Oauth Urls*/
        this.oauthAuthorizeUrl = Urls.oauthBaseUrl + "authorize/request";
        this.oauthVerifyTokenUrl = Urls.oauthBaseUrl + "token/verify";
        this.oauthTokenUrl = Urls.oauthBaseUrl + "token/get";


        /*Api Urls*/
        this.pingUrl = Urls.apiBaseUrl + "Initialize/ping";
        this.apiInitialize = Urls.apiBaseUrl + "Initialize";
        this.apiLogout = Urls.apiBaseUrl + "Initialize/logout";
        this.apiLanguage = Urls.apiBaseUrl + "Initialize/language";
        this.apiCountry = Urls.apiBaseUrl + "Initialize/country";
        this.apiUser = Urls.apiBaseUrl + "agent/User";
        this.apiUserToggle = Urls.apiBaseUrl + "agent/User/toggle";
        this.apiGetBusTypes = Urls.apiBaseUrl + "app/Bus/types";
        this.apiGetTripsNewStatusList = Urls.apiBaseUrl + "app/Trip/newStatus";
        this.apiGetTripsAllStatusList = Urls.apiBaseUrl + "app/Trip/allStatus";
        this.apiGetLocationTypes = Urls.apiBaseUrl + "app/Location/types";
        this.apiGetTicketTypes = Urls.apiBaseUrl + "app/Ticket/types";
        this.apiTrip = Urls.apiBaseUrl + "agent/Trip";
        this.apiTrips = Urls.apiBaseUrl + "agent/Trip/list";
        this.apiTripBus = Urls.apiBaseUrl + "agent/Trip/bus";
        this.apiTripReserve = Urls.apiBaseUrl + "agent/Trip/reserve";
        this.apiBus = Urls.apiBaseUrl + "agent/Bus";
        this.apiBuses = Urls.apiBaseUrl + "agent/Bus/list";
        this.apiBusImage = Urls.apiBaseUrl + "agent/Bus/image";
        this.apiBusShare = Urls.apiBaseUrl + "agent/Bus/share";
        this.apiTicket = Urls.apiBaseUrl + "agent/Ticket";
        this.apiTicketToggle = Urls.apiBaseUrl + "agent/Ticket/toggle";
        this.apiGetDashboard = Urls.apiBaseUrl + "agent/common/dashboard";
        this.apiGetPartnerBusTypes = Urls.apiBaseUrl + "agent/Bus/types";
        this.apiGetBookings = Urls.apiBaseUrl + "agent/Booking/tripList";
        this.apiGetBookingInfo = Urls.apiBaseUrl + "agent/Booking/tripInfo";
        this.apiVerifyBooking = Urls.apiBaseUrl + "agent/Booking/verifyTrip";
        this.apiUpdateTripStatus = Urls.apiBaseUrl + "agent/Trip/status";
        this.apiUpdateTripBusType = Urls.apiBaseUrl + "agent/Trip/busType";
        this.apiUpdatePartnerLogo = Urls.apiBaseUrl + "agent/User/logo";
        this.apiGetAgents = Urls.apiBaseUrl + "agent/User/list";
        this.apiAdmin = Urls.apiBaseUrl + "agent/User/admin";
        this.apiVerify = Urls.apiBaseUrl + "agent/User/verify";
        this.apiGetPayin = Urls.apiBaseUrl + "agent/Transaction/payin";
        this.apiGetPayout = Urls.apiBaseUrl + "agent/Transaction/payout";
        this.apiGetBanks = Urls.apiBaseUrl + "agent/Transaction/banks";
        this.apiPayInRequest = Urls.apiBaseUrl + "agent/Transaction/payInRequest";
        this.apiPayoutRequest = Urls.apiBaseUrl + "agent/Transaction/payoutRequest"
        this.apiLocation = Urls.apiBaseUrl + "agent/Location";
        this.apiLocations = Urls.apiBaseUrl + "agent/Location/list";

        /*Custom Urls*/
        this.googleApiUrl = "https://maps.googleapis.com/maps/api/js?key=<key>&libraries=places"
    }
}