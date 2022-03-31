/**Use this class to manage
 * all Requests Urls
 * */
import { ENVIRONMENT } from "../../environments/environment";
import { ENV } from "../../environments/ENV";
export class Urls {

  /*Base Urls*/
  public static get appUrl(): string {
    switch (ENVIRONMENT) {
      case ENV.PROD:
        return "https://wecari.com/";
      case ENV.TEST:
        return "https://staging.wecari.com/";
      case ENV.DEV:
      default:
        return "http://localhost/";
    }
  }
  public static get apiBaseUrl(): string {
    switch (ENVIRONMENT) {
      case ENV.PROD:
        return "https://api.wecari.com/";
      case ENV.TEST:
        return "https://api.staging.wecari.com/";
      case ENV.DEV:
      default:
        return "http://localhost:8080/";
    }
  }
  public static get oauthBaseUrl(): string {
    switch (ENVIRONMENT) {
      case ENV.PROD:
        return "https://oauth.wecari.com/";
      case ENV.TEST:
        return "https://oauth.staging.wecari.com/";
      case ENV.DEV:
      default:
        return "http://localhost:8000/";
    }
  }
  public static baseUrl(env = ENVIRONMENT): string {
    switch (env) {
      case ENV.PROD:
        return "https://partner.wecari.com/";
      case ENV.TEST:
        return "https://partner.staging.wecari.com/";
      case ENV.DEV:
      default:
        return "http://localhost:8100/";
    }
  }

  /*Generic Urls*/
  public static support = Urls.appUrl + "support";
  public static termsUrl = Urls.appUrl + "terms";
  public static privacyUrl = Urls.appUrl + "privacy";
  public static partnerOauthRedirectUrl = Urls.baseUrl() + "hooks/oauth/authorize";

  /*Oauth Urls*/
  public static oauthAuthorizeUrl = Urls.oauthBaseUrl + "authorize/request";
  public static oauthVerifyTokenUrl = Urls.oauthBaseUrl + "token/verify";
  public static oauthTokenUrl = Urls.oauthBaseUrl + "token/request";

  /*Api Urls*/
  public static pingUrl = Urls.apiBaseUrl + "initialize/ping";
  public static apiInitialize = Urls.apiBaseUrl + "initialize";
  public static apiLogout = Urls.apiBaseUrl + "initialize/logout";
  public static apiLanguage = Urls.apiBaseUrl + "initialize/language";
  public static apiCountry = Urls.apiBaseUrl + "initialize/country";
  public static apiUser = Urls.apiBaseUrl + "agent/user";
  public static apiUserToggle = Urls.apiBaseUrl + "agent/user/toggle";
  public static apiGetBusTypes = Urls.apiBaseUrl + "app/bus/types";
  public static apiGetTripStatusList = Urls.apiBaseUrl + "app/trip/status";
  public static apiGetLocationTypes = Urls.apiBaseUrl + "app/location/types";
  public static apiGetTicketTypes = Urls.apiBaseUrl + "app/ticket/types";
  public static apiTrip = Urls.apiBaseUrl + "agent/trip";
  public static apiTrips = Urls.apiBaseUrl + "agent/trip/list";
  public static apiTripBus = Urls.apiBaseUrl + "agent/trip/bus";
  public static apiTripReserve = Urls.apiBaseUrl + "agent/trip/reserve";
  public static apiBus = Urls.apiBaseUrl + "agent/bus";
  public static apiBuses = Urls.apiBaseUrl + "agent/bus/list";
  public static apiBusImage = Urls.apiBaseUrl + "agent/bus/image";
  public static apiBusShare = Urls.apiBaseUrl + "agent/bus/share";
  public static apiTicket = Urls.apiBaseUrl + "agent/ticket";
  public static apiTicketToggle = Urls.apiBaseUrl + "agent/ticket/toggle";
  public static apiGetDashboard = Urls.apiBaseUrl + "agent/common/dashboard";
  public static apiGetPartnerBusTypes = Urls.apiBaseUrl + "agent/bus/types";
  public static apiGetBookings = Urls.apiBaseUrl + "agent/booking/triplist";
  public static apiGetBookingInfo = Urls.apiBaseUrl + "agent/booking/tripinfo";
  public static apiVerifyBooking = Urls.apiBaseUrl + "agent/booking/verifytrip";
  public static apiUpdateTripStatus = Urls.apiBaseUrl + "agent/trip/status";
  public static apiUpdateTripBusType = Urls.apiBaseUrl + "agent/trip/bustype";
  public static apiUpdatePartnerLogo = Urls.apiBaseUrl + "agent/user/logo";
  public static apiGetAgents = Urls.apiBaseUrl + "agent/user/list";
  public static apiAdmin = Urls.apiBaseUrl + "agent/user/admin";
  public static apiVerify = Urls.apiBaseUrl + "agent/user/verify";
  public static apiGetPayin = Urls.apiBaseUrl + "agent/transaction/payin";
  public static apiGetPayout = Urls.apiBaseUrl + "agent/transaction/payout";
  public static apiGetBanks = Urls.apiBaseUrl + "agent/transaction/banks";
  public static apiPayInRequest = Urls.apiBaseUrl + "agent/transaction/payinrequest";
  public static apiPayoutRequest = Urls.apiBaseUrl + "agent/transaction/payoutrequest";
  public static apiLocation = Urls.apiBaseUrl + "agent/location";
  public static apiLocations = Urls.apiBaseUrl + "agent/location/list";

  /*Custom Urls*/
  public static googleApiUrl =
    "https://maps.googleapis.com/maps/api/js?key=<key>&libraries=places";
}
