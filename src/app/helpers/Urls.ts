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
        return "https://busarm.com/";
      case ENV.TEST:
        return "https://staging.busarm.com/";
      case ENV.DEV:
      default:
        return "http://localhost/";
    }
  }
  public static get apiBaseUrl(): string {
    switch (ENVIRONMENT) {
      case ENV.PROD:
        return "https://api.busarm.com/";
      case ENV.TEST:
        return "https://api.staging.busarm.com/";
      case ENV.DEV:
      default:
        return "http://localhost:8080/";
    }
  }
  public static get oauthBaseUrl(): string {
    switch (ENVIRONMENT) {
      case ENV.PROD:
        return "https://oauth.busarm.com/";
      case ENV.TEST:
        return "https://oauth.staging.busarm.com/";
      case ENV.DEV:
      default:
        return "http://localhost:8000/";
    }
  }
  public static baseUrl(env = ENVIRONMENT): string {
    switch (env) {
      case ENV.PROD:
        return "https://partner.busarm.com/";
      case ENV.TEST:
        return "https://partner.staging.busarm.com/";
      case ENV.DEV:
      default:
        return "http://localhost:8100/";
    }
  }

  /*Generic Urls*/
  public static appPartnerUrl = Urls.appUrl + "partner";
  public static supportUrl = Urls.appUrl + "support";
  public static termsUrl = Urls.appUrl + "terms";
  public static privacyUrl = Urls.appUrl + "privacy";
  public static accountSecurityUrl = Urls.appUrl + "account/security";
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
  public static apiBusTypes = Urls.apiBaseUrl + "app/bus/types";
  public static apiTripStatusList = Urls.apiBaseUrl + "app/trip/status";
  public static apiLocationTypes = Urls.apiBaseUrl + "app/location/types";
  public static apiTicketTypes = Urls.apiBaseUrl + "app/ticket/types";
  public static apiTrip = Urls.apiBaseUrl + "agent/trip";
  public static apiTrips = Urls.apiBaseUrl + "agent/trip/list";
  public static apiTripBus = Urls.apiBaseUrl + "agent/trip/bus";
  public static apiTripReserve = Urls.apiBaseUrl + "agent/trip/reserve";
  public static apiTripPickupLocation = Urls.apiBaseUrl + "agent/trip/pickup";
  public static apiTripDropoffLocation = Urls.apiBaseUrl + "agent/trip/dropoff";
  public static apiBus = Urls.apiBaseUrl + "agent/bus";
  public static apiBusAmenity = Urls.apiBaseUrl + "agent/bus/amenities";
  public static apiBuses = Urls.apiBaseUrl + "agent/bus/list";
  public static apiBusImage = Urls.apiBaseUrl + "agent/bus/image";
  public static apiBusShare = Urls.apiBaseUrl + "agent/bus/share";
  public static apiTicket = Urls.apiBaseUrl + "agent/ticket";
  public static apiTicketToggle = Urls.apiBaseUrl + "agent/ticket/toggle";
  public static apiDashboard = Urls.apiBaseUrl + "agent/common/dashboard";
  public static apiAgentBusTypes = Urls.apiBaseUrl + "agent/bus/types";
  public static apiBooking = Urls.apiBaseUrl + "agent/booking";
  public static apiBookings = Urls.apiBaseUrl + "agent/booking/list";
  public static apiValidateBooking = Urls.apiBaseUrl + "agent/booking/validate";
  public static apiVerifyBooking = Urls.apiBaseUrl + "agent/booking/verify";
  public static apiTripStatus = Urls.apiBaseUrl + "agent/trip/status";
  public static apiTripBusType = Urls.apiBaseUrl + "agent/trip/bustype";
  public static apiAgentLogo = Urls.apiBaseUrl + "agent/user/logo";
  public static apiAgents = Urls.apiBaseUrl + "agent/user/list";
  public static apiAgent = Urls.apiBaseUrl + "agent/user";
  public static apiAgentAdmin = Urls.apiBaseUrl + "agent/user/admin";
  public static apiAgentVerify = Urls.apiBaseUrl + "agent/user/verify";
  public static apiTransactionPayin = Urls.apiBaseUrl + "agent/transaction/payin";
  public static apiTransactionPayout = Urls.apiBaseUrl + "agent/transaction/payout";
  public static apiTransactionBanks = Urls.apiBaseUrl + "agent/transaction/banks";
  public static apiTransactionPayInRequest = Urls.apiBaseUrl + "agent/transaction/payinrequest";
  public static apiTransactionPayoutRequest = Urls.apiBaseUrl + "agent/transaction/payoutrequest";
  public static apiLocation = Urls.apiBaseUrl + "agent/location";
  public static apiLocations = Urls.apiBaseUrl + "agent/location/list";

  /*Custom Urls*/
  public static googleApiUrl =
    "https://maps.googleapis.com/maps/api/js?key=<key>&libraries=places";
}
