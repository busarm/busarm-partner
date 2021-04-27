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
    public static baseUrl(env = ENVIRONMENT):string {
        switch (env){
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
        this.support = Urls.appUrl + "support";
        this.termsUrl = Urls.appUrl + "terms";
        this.privacyUrl = Urls.appUrl + "privacy";
        this.partnerOauthRedirectUrl = Urls.baseUrl() + "hooks/oauth/authorize"

        /*Oauth Urls*/
        this.oauthAuthorizeUrl = Urls.oauthBaseUrl + "authorize/request";
        this.oauthVerifyTokenUrl = Urls.oauthBaseUrl + "token/verify";
        this.oauthTokenUrl = Urls.oauthBaseUrl + "token/get";


        /*Api Urls*/
        this.pingUrl = Urls.apiBaseUrl + "initialize/ping";
        this.apiInitialize = Urls.apiBaseUrl + "initialize";
        this.apiLogout = Urls.apiBaseUrl + "initialize/logout";
        this.apiLanguage = Urls.apiBaseUrl + "initialize/language";
        this.apiCountry = Urls.apiBaseUrl + "initialize/country";
        this.apiUser = Urls.apiBaseUrl + "agent/user";
        this.apiUserToggle = Urls.apiBaseUrl + "agent/user/toggle";
        this.apiGetBusTypes = Urls.apiBaseUrl + "app/bus/types";
        this.apiGetTripsNewStatusList = Urls.apiBaseUrl + "app/trip/newstatus";
        this.apiGetTripsAllStatusList = Urls.apiBaseUrl + "app/trip/allstatus";
        this.apiGetLocationTypes = Urls.apiBaseUrl + "app/location/types";
        this.apiGetTicketTypes = Urls.apiBaseUrl + "app/ticket/types";
        this.apiTrip = Urls.apiBaseUrl + "agent/trip";
        this.apiTrips = Urls.apiBaseUrl + "agent/trip/list";
        this.apiTripBus = Urls.apiBaseUrl + "agent/trip/bus";
        this.apiTripReserve = Urls.apiBaseUrl + "agent/trip/reserve";
        this.apiBus = Urls.apiBaseUrl + "agent/bus";
        this.apiBuses = Urls.apiBaseUrl + "agent/bus/list";
        this.apiBusImage = Urls.apiBaseUrl + "agent/bus/image";
        this.apiBusShare = Urls.apiBaseUrl + "agent/bus/share";
        this.apiTicket = Urls.apiBaseUrl + "agent/ticket";
        this.apiTicketToggle = Urls.apiBaseUrl + "agent/ticket/toggle";
        this.apiGetDashboard = Urls.apiBaseUrl + "agent/common/dashboard";
        this.apiGetPartnerBusTypes = Urls.apiBaseUrl + "agent/bus/types";
        this.apiGetBookings = Urls.apiBaseUrl + "agent/booking/triplist";
        this.apiGetBookingInfo = Urls.apiBaseUrl + "agent/booking/tripinfo";
        this.apiVerifyBooking = Urls.apiBaseUrl + "agent/booking/verifytrip";
        this.apiUpdateTripStatus = Urls.apiBaseUrl + "agent/trip/status";
        this.apiUpdateTripBusType = Urls.apiBaseUrl + "agent/trip/bustype";
        this.apiUpdatePartnerLogo = Urls.apiBaseUrl + "agent/user/logo";
        this.apiGetAgents = Urls.apiBaseUrl + "agent/user/list";
        this.apiAdmin = Urls.apiBaseUrl + "agent/user/admin";
        this.apiVerify = Urls.apiBaseUrl + "agent/user/verify";
        this.apiGetPayin = Urls.apiBaseUrl + "agent/transaction/payin";
        this.apiGetPayout = Urls.apiBaseUrl + "agent/transaction/payout";
        this.apiGetBanks = Urls.apiBaseUrl + "agent/transaction/banks";
        this.apiPayInRequest = Urls.apiBaseUrl + "agent/transaction/payinrequest";
        this.apiPayoutRequest = Urls.apiBaseUrl + "agent/transaction/payoutrequest"
        this.apiLocation = Urls.apiBaseUrl + "agent/location";
        this.apiLocations = Urls.apiBaseUrl + "agent/location/list";

        /*Custom Urls*/
        this.googleApiUrl = "https://maps.googleapis.com/maps/api/js?key=<key>&libraries=places"
    }
}