import { HttpResponse, HttpErrorResponse } from "@angular/common/http";
import { Oauth, OauthStorageKeys } from "busarm-oauth-client-js";
import CryptoJS from "crypto-js";

import { Urls } from "./Urls";
import { DashboardResponse } from "../models/DashboardResponse";
import { BankListResponse } from "../models/BankListResponse";
import { PayOutTransactionResponse } from "../models/Transaction/PayOutTransactionResponse";
import { PayInTransactionResponse } from "../models/Transaction/PayInTransactionResponse";
import { LocationTypeListResponse } from "../models/Location/LocationTypeListResponse";
import { LocationListResponse } from "../models/Location/LocationListResponse";
import { BusTypeListResponse } from "../models/Bus/BusTypeListResponse";
import { StatusListResponse } from "../models/StatusListResponse";
import { BusResponse } from "../models/Bus/BusResponse";
import { BusListResponse } from "../models/Bus/BusListResponse";
import { TicketTypeListRepsonse } from "../models/Ticket/TicketTypeListRepsonse";
import { TripResponse } from "../models/Trip/TripResponse";
import { TripListResponse } from "../models/Trip/TripListResponse";
import { BookingResponse } from "../models/Booking/BookingResponse";
import { BookingListResponse } from "../models/Booking/BookingListResponse";
import { UserListResponse } from "../models/User/UserListResponse";
import { UserResponse } from "../models/User/UserResponse";
import { SessionResponse } from "../models/SessionResponse";
import { BaseResponse } from "../models/BaseResponse";
import { Utils } from "./Utils";
import { Strings } from "../resources";
import { CIPHER } from "./CIPHER";
import { SessionService } from "../services/app/SessionService";
import { NetworkProvider } from "../services/app/NetworkProvider";
import { AuthService } from "../services/app/AuthService";

/**Define the types of Api Responses*/
export enum ApiResponseType {
  Api_Success,
  Api_Error,
  Authorization_error,
  Network_error,
  Unknown,
}

/**Http Request Method*/
export enum ApiRequestMethod {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete",
}

/**Define the Api Request & Response Params*/
export interface ApiResponse<T> {
  status: boolean;
  msg?: string;
  result?: T;
  type?: ApiResponseType;
  cached?: boolean;
}

export type ApiCallback<T> = (data: ApiResponse<T>) => any;

export interface ApiRequestParams {
  url: string;
  method?: ApiRequestMethod;
  headers?: { [key in string]: any };
  params?: { [key in string]: any };
  encrypt?: boolean;
  cache?: boolean;
  cacheId?: string;
  loadCache?: boolean;
  callback?: ApiCallback<BaseResponse>;
}

/**Put All Api requests here so it can be
 * reused globally whenever needed
 * */
export class Api {
  private cacheLoaded = false;

  /**
   * Constructor
   * @param {ApiRequestParams} requestParams
   */
  private constructor(requestParams: ApiRequestParams) {
    if (!requestParams.cacheId) {
      requestParams.cacheId = String(Utils.hashString(requestParams.url));
    }

    /**Start request */
    this.start(requestParams);
  }

  /**
   * Start request
   * @param requestParams ApiRequestParams
   */
  private async start(requestParams: ApiRequestParams) {
    if (requestParams.headers == null) {
      requestParams.headers = [];
    }

    /**Add Session Token header*/
    let session = await SessionService.instance.getSession();
    requestParams.headers["X-Session-Token"] = Utils.assertAvailable(session)
      ? Utils.safeString(session.session_token)
      : "";

    /**Encrypt params if requested*/
    if (requestParams.encrypt) {
      if (session != null) {
        CIPHER.encrypt(
          session.encryption_key,
          Utils.toJson(requestParams.params),
          (status, cipher) => {
            if (status) {
              requestParams.params = {
                data: cipher,
              };
              /**Add Encrypted header*/
              requestParams.headers["X-Encrypted"] = "1";
              this.processRequest(requestParams, true, session.encryption_key);
            } else {
              this.processRequest(requestParams, false);
            }
          }
        );
      } else {
        this.processRequest(requestParams, false);
      }
    } else {
      this.processRequest(requestParams, false);
    }
  }

  /**
   * This Performs the request and returns the results
   * @param {ApiRequestParams} requestParams
   */
  private static performRequest(
    requestParams: ApiRequestParams = {
      url: null,
      method: ApiRequestMethod.GET,
      params: null,
      encrypt: false,
      cache: false,
      cacheId: null,
      loadCache: false,
      callback: null,
    }
  ) {
    new Api(requestParams);
  }

  /**
   * Process Api Request
   * @param requestParams
   * @param encryptedRequest
   * @param encryptionKey
   */
  private async processRequest(
    requestParams: ApiRequestParams,
    encryptedRequest: boolean,
    encryptionKey?: string
  ) {
    const processWithMethod = () => {
      switch (requestParams.method) {
        case ApiRequestMethod.DELETE:
          return NetworkProvider.instance.httpClient.delete(requestParams.url, {
            headers: requestParams.headers,
            params: requestParams.params,
            observe: "response",
            responseType: "text",
          });
        case ApiRequestMethod.PUT:
          return NetworkProvider.instance.httpClient.put(
            requestParams.url,
            requestParams.params,
            {
              headers: requestParams.headers,
              observe: "response",
              responseType: "text",
            }
          );
        case ApiRequestMethod.POST:
          return NetworkProvider.instance.httpClient.post(
            requestParams.url,
            requestParams.params,
            {
              headers: requestParams.headers,
              observe: "response",
              responseType: "text",
            }
          );
        case ApiRequestMethod.GET:
        default:
          return NetworkProvider.instance.httpClient.get(requestParams.url, {
            observe: "response",
            responseType: "text",
            headers: requestParams.headers,
            params: requestParams.params,
          });
      }
    };

    /*Respond first from cache*/
    if (requestParams.cache && requestParams.loadCache) {
      // Get cached response
      let cache = await SessionService.instance.get(requestParams.cacheId);
      if (cache) {
        if (requestParams.callback) {
          requestParams.callback({
            status: true,
            result: cache,
            type: ApiResponseType.Api_Success,
            cached: true,
          });
          this.cacheLoaded = true;
        }
      }
    }

    /*Add Authorization header*/
    let token = await Oauth.storage.get(OauthStorageKeys.AccessTokenKey);
    let tokenType = await Oauth.storage.get(OauthStorageKeys.TokenTypeKey);
    if (token) {
      requestParams.headers["Authorization"] = `${tokenType || "Bearer"
        } ${token}`;
    }

    /*Process Request*/
    processWithMethod().subscribe(
      (result) => {
        const encryptedResponse = result.headers.get("X-Encrypted") == "1";
        if (encryptedResponse) {
          // If Response is Encrypted
          const integrity = result.headers.get("X-Integrity");
          if (this.verifyIntegrity(result.body, integrity, encryptionKey)) {
            // Verify Integrity of response
            CIPHER.decrypt(encryptionKey, result.body, (status, plain) => {
              if (status) {
                this.processResponse(
                  true,
                  {
                    ok: result.ok,
                    status: result.status,
                    statusText: result.statusText,
                    clone: result.clone,
                    type: result.type,
                    url: result.url,
                    headers: result.headers,
                    body: plain,
                  },
                  requestParams
                );
              } else {
                if (!this.cacheLoaded) {
                  requestParams.callback({
                    status: false,
                    msg: Strings.getString("error_unexpected"),
                    type: ApiResponseType.Unknown,
                  });
                }
              }
            });
          } else {
            if (!this.cacheLoaded) {
              requestParams.callback({
                status: false,
                msg: Strings.getString("error_unexpected"),
                type: ApiResponseType.Unknown,
              });
            }
          }
        } else {
          this.processResponse(result.ok, result, requestParams);
        }
      },
      (err) => {
        this.processResponse(false, err, requestParams);
      }
    );
  }

  /**
   * Process Api Response
   * @param status
   * @param result
   * @param requestParams
   */
  private async processResponse(
    status: boolean,
    result: HttpErrorResponse | HttpResponse<any> | any,
    requestParams: ApiRequestParams
  ) {
    if (result) {
      if (status) {
        // Json Data available
        const data = Utils.parseJson(result.body);
        if (data) {
          // Check API status
          if (data.status) {
            if (requestParams.cache) {
              // Get cached response
              let cache = await SessionService.instance.get(
                requestParams.cacheId
              );
              if (cache) {
                // Compare new response to cached response
                if (Utils.toJson(cache) != Utils.toJson(data)) {
                  if (requestParams.callback) {
                    requestParams.callback({
                      status: true,
                      result: data,
                      type: ApiResponseType.Api_Success,
                    });
                  }
                  SessionService.instance.set(requestParams.cacheId, data); // cache response
                } else {
                  if (!this.cacheLoaded) {
                    if (requestParams.callback) {
                      requestParams.callback({
                        status: true,
                        result: data,
                        type: ApiResponseType.Api_Success,
                      });
                    }
                  }
                }
              } else {
                if (requestParams.callback) {
                  requestParams.callback({
                    status: true,
                    result: data,
                    type: ApiResponseType.Api_Success,
                  });
                }
                SessionService.instance.set(requestParams.cacheId, data); // cache response
              }
            } else {
              if (requestParams.callback) {
                requestParams.callback({
                  status: true,
                  result: data,
                  type: ApiResponseType.Api_Success,
                });
              }
            }
          } else {
            if (requestParams.callback) {
              requestParams.callback({
                status: false,
                msg: data.msg || Strings.getString("error_connection"),
                type: ApiResponseType.Api_Error,
              });
            }
            SessionService.instance.remove(requestParams.cacheId); // remove cache
          }
        } else {
          requestParams.callback({
            status: false,
            msg: Strings.getString("error_unexpected"),
            type: ApiResponseType.Unknown,
          });
          SessionService.instance.remove(requestParams.cacheId); // remove cache
        }
      } else {
        const data = result.body
          ? Utils.parseJson(result.body)
          : result.error
            ? Utils.parseJson(result.error)
            : {};
        if (result.status === 401) {
          // Failed to authenticate api access
          if (requestParams.callback) {
            requestParams.callback({
              status: false,
              msg:
                data && data.msg
                  ? data.msg
                  : Strings.getString("error_access_expired"),
              type: ApiResponseType.Authorization_error,
            });
          }
          // Logout
          AuthService.instance.logout();
        } else if (result.status === 403) {
          // Failed to authorize access
          if (requestParams.callback) {
            requestParams.callback({
              status: false,
              msg:
                data && data.msg
                  ? data.msg
                  : Strings.getString("error_access_expired"),
              type: ApiResponseType.Authorization_error,
            });
          }
        } else {
          if (requestParams.cache) {
            // Get cached response
            let cache = await SessionService.instance.get(
              requestParams.cacheId
            );
            if (cache) {
              // Check Internet connection
              if (!NetworkProvider.instance.isOnline()) {
                if (requestParams.callback) {
                  requestParams.callback({
                    status: true,
                    result: cache,
                    type: ApiResponseType.Api_Success,
                    cached: true,
                  });
                  NetworkProvider.instance
                    .checkConnection()
                    .then((connected) => {
                      if (!connected) {
                        requestParams.callback({
                          status: false,
                          msg: Strings.getString("error_connection"),
                          type: ApiResponseType.Network_error,
                        });
                      }
                    });
                }
              } else if (requestParams.callback) {
                requestParams.callback({
                  status: true,
                  result: cache,
                  type: ApiResponseType.Api_Success,
                });
              }
            } else if (!this.cacheLoaded && requestParams.callback) {
              // Check Internet connection
              if (!NetworkProvider.instance.isOnline()) {
                NetworkProvider.instance.checkConnection().then((connected) => {
                  if (requestParams.callback) {
                    requestParams.callback({
                      status: false,
                      msg: connected
                        ? data && data.msg
                          ? data.msg
                          : Strings.getString("error_unexpected")
                        : Strings.getString("error_connection"),
                      type: connected
                        ? ApiResponseType.Unknown
                        : ApiResponseType.Network_error,
                    });
                  }
                });
              } else if (requestParams.callback) {
                requestParams.callback({
                  status: false,
                  msg:
                    data && data.msg
                      ? data.msg
                      : Strings.getString("error_unexpected"),
                  type: ApiResponseType.Unknown,
                });
              }
            }
          } else {
            // Check Internet connection
            if (!NetworkProvider.instance.isOnline()) {
              NetworkProvider.instance.checkConnection().then((connected) => {
                if (requestParams.callback) {
                  requestParams.callback({
                    status: false,
                    msg: connected
                      ? Strings.getString("error_unexpected")
                      : Strings.getString("error_connection"),
                    type: connected
                      ? ApiResponseType.Unknown
                      : ApiResponseType.Network_error,
                  });
                }
              });
            } else if (!this.cacheLoaded && requestParams.callback) {
              requestParams.callback({
                status: false,
                msg:
                  data && data.msg
                    ? data.msg
                    : Strings.getString("error_unexpected"),
                type: ApiResponseType.Unknown,
              });
            }
          }
        }
      }
    } else {
      if (!this.cacheLoaded) {
        if (requestParams.callback) {
          requestParams.callback({
            status: false,
            msg: Strings.getString("error_unexpected"),
            type: ApiResponseType.Unknown,
          });
        }
      }
    }
  }

  /**
   * Verify integrity of response
   * @param data string data gotten from response
   * @param x_integrity string integrity of data to be compared with
   * @param key string Encryption key
   * */
  private verifyIntegrity(data: string, x_integrity: string, key: string) {
    return x_integrity === CIPHER.getDigest(data, CryptoJS.MD5(key).toString());
  }

  /*----------------------- API FUNCTIONS ---------------------*/

  /**Initialize api session
   * @param data
   * @param callback
   * */
  public static initialize(
    data: {
      agent?: string;
      os: string;
      version: string;
      app_name: string;
      device_type: string;
      device_name: string;
      partner: boolean;
    },
    callback: ApiCallback<SessionResponse>
  ) {
    this.performRequest({
      url: Urls.apiInitialize,
      method: ApiRequestMethod.POST,
      params: data,
      cache: false,
      callback: callback,
    });
  }

  /**Set Current Country
   * @param country_code
   * @param callback
   * */
  public static setCountry(
    country_code: string,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      method: ApiRequestMethod.POST,
      params: {
        country: country_code,
      },
      url: Urls.apiCountry,
      cache: false,
      callback: callback,
    });
  }

  /**Set Current Language
   * @param lang_code
   * @param callback
   * */
  public static setLanguage(
    lang_code: string,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      method: ApiRequestMethod.POST,
      params: {
        lang: lang_code,
      },
      url: Urls.apiLanguage,
      cache: false,
      callback: callback,
    });
  }

  /**Logout Users
   * @param callback
   * */
  public static logout(callback: ApiCallback<BaseResponse>) {
    this.performRequest({
      url: Urls.apiLogout,
      method: ApiRequestMethod.GET,
      callback: callback,
    });
  }

  /**Get User Data
   * @param callback
   * */
  public static getUserInfo(callback: ApiCallback<UserResponse>) {
    this.performRequest({
      url: Urls.apiUser,
      callback: callback,
    });
  }

  /**Get Agents Data
   * @param callback
   * @param loadCache
   * */
  public static getAgents(
    callback: ApiCallback<UserListResponse>,
    loadCache = true
  ) {
    this.performRequest({
      url: Urls.apiGetAgents,
      cache: true,
      loadCache: loadCache,
      callback: callback,
    });
  }

  /**Get trip info
   * @param tripId
   * @param callback
   * */
  public static getTrip(tripId: string, callback: ApiCallback<TripResponse>) {
    this.performRequest({
      url: Urls.apiTrip,
      params: {
        tripId: tripId,
      },
      cache: true,
      loadCache: true,
      cacheId: String(Utils.hashString(Urls.apiTrip + tripId)),
      callback: callback,
    });
  }

  /**Get agent trip list
   * @param date
   * @param callback
   * */
  public static getTrips(date, callback: ApiCallback<TripListResponse>) {
    this.performRequest({
      url: Urls.apiTrips,
      params: {
        date: date,
      },
      cache: true,
      loadCache: true,
      cacheId: String(Utils.hashString(Urls.apiTrips + date)),
      callback: callback,
    });
  }

  /**Get bus
   * @param busId
   * @param callback
   * */
  public static getBus(busId: string, callback: ApiCallback<BusResponse>) {
    this.performRequest({
      url: Urls.apiBus,
      params: {
        busId: busId,
      },
      cache: true,
      loadCache: true,
      cacheId: String(Utils.hashString(Urls.apiBus + busId)),
      callback: callback,
    });
  }

  /**Get bus lists
   * @param callback
   * */
  public static getBuses(callback: ApiCallback<BusListResponse>) {
    this.performRequest({
      url: Urls.apiBuses,
      cache: true,
      loadCache: true,
      callback: callback,
    });
  }

  /**Get bus lists
   * @param typeId
   * @param callback
   * */
  public static getBusesForType(
    typeId: any,
    callback: ApiCallback<BusListResponse>
  ) {
    this.performRequest({
      url: Urls.apiBuses,
      params: {
        typeId: typeId,
      },
      cache: true,
      loadCache: true,
      cacheId: String(Utils.hashString(Urls.apiBuses + typeId)),
      callback: callback,
    });
  }

  /**Get Partner Locations Data
   * @param callback
   * */
  public static getLocations(callback: ApiCallback<LocationListResponse>) {
    this.performRequest({
      url: Urls.apiLocations,
      cache: true,
      loadCache: true,
      callback: callback,
    });
  }

  /**Get Active trips for booking
   * @param minDate
   * @param maxDate
   * @param noAction
   * @param callback
   * */
  public static getDashboard(
    minDate,
    maxDate,
    callback: ApiCallback<DashboardResponse>
  ) {
    this.performRequest({
      url: Urls.apiGetDashboard,
      cache: true,
      loadCache: false,
      params: {
        min_date: minDate,
        max_date: maxDate,
      },
      cacheId: String(
        Utils.hashString(Urls.apiGetDashboard + minDate + maxDate)
      ),
      callback: callback,
    });
  }

  /**Get Banks
   * @param callback
   * */
  public static getBanks(
    countryCode: string,
    methodId: any,
    callback: ApiCallback<BankListResponse>
  ) {
    this.performRequest({
      url: Urls.apiGetBanks,
      params: {
        countryCode: countryCode,
        methodId: methodId,
      },
      cache: true,
      loadCache: true,
      cacheId: String(
        Utils.hashString(Urls.apiGetBanks + countryCode + methodId)
      ),
      callback: callback,
    });
  }

  /**Get Payin Transactions
   * @param callback
   * */
  public static getPayInTransactions(
    callback: ApiCallback<PayInTransactionResponse>
  ) {
    this.performRequest({
      url: Urls.apiGetPayin,
      cache: true,
      callback: callback,
    });
  }

  /**Get Payout Transactions
   * @param callback
   * */
  public static getPayOutTransactions(
    callback: ApiCallback<PayOutTransactionResponse>
  ) {
    this.performRequest({
      url: Urls.apiGetPayout,
      cache: true,
      callback: callback,
    });
  }

  /**Get Booking list
   * @param callback
   * */
  public static getBookings(
    status: string,
    min_date: string,
    max_date: string,
    callback: ApiCallback<BookingListResponse>
  ) {
    this.performRequest({
      url: Urls.apiGetBookings,
      params: {
        status: status,
        min_date: min_date,
        max_date: max_date,
      },
      cache: true,
      loadCache: true,
      cacheId: String(
        Utils.hashString(Urls.apiGetBookings + status + min_date + max_date)
      ),
      callback: callback,
    });
  }

  /**Validate Booking
   * @param referenceCode
   * @param callback
   * */
  public static validateBooking(
    referenceCode: string,
    callback: ApiCallback<BookingResponse>
  ) {
    this.performRequest({
      url: Urls.apiValidateBooking,
      params: {
        reference_code: referenceCode,
      },
      cache: true,
      cacheId: String(
        Utils.hashString(Urls.apiValidateBooking + referenceCode)
      ),
      callback: callback,
    });
  }

  /**Get Booking
   * @param id
   * @param callback
   * */
  public static getBooking(id: string, callback: ApiCallback<BookingResponse>) {
    this.performRequest({
      url: Urls.apiGetBooking,
      params: {
        booking_id: id,
      },
      cache: true,
      cacheId: String(Utils.hashString(Urls.apiGetBooking + id)),
      callback: callback,
    });
  }

  /**Get Trip Status List for new trips
   * @param callback
   * */
  public static getNewTripStatusList(
    callback: ApiCallback<StatusListResponse>
  ) {
    this.performRequest({
      url: Urls.apiGetTripStatusList,
      cache: true,
      loadCache: true,
      params: {
        isNew: true,
      },
      cacheId: String(Utils.hashString(Urls.apiGetTripStatusList + 1)),
      callback: callback,
    });
  }

  /**Get All Trip Status List
   * @param callback
   * */
  public static getAllTripStatusList(
    callback: ApiCallback<StatusListResponse>
  ) {
    this.performRequest({
      url: Urls.apiGetTripStatusList,
      cache: true,
      loadCache: true,
      callback: callback,
    });
  }

  /**Get All Bus Types
   * @param callback
   * */
  public static getBusTypes(callback: ApiCallback<BusTypeListResponse>) {
    this.performRequest({
      url: Urls.apiGetBusTypes,
      cache: true,
      loadCache: true,
      callback: callback,
    });
  }

  /**Get Partner Bus Types
   * @param callback
   * */
  public static getPartnerBusTypes(callback: ApiCallback<BusTypeListResponse>) {
    this.performRequest({
      url: Urls.apiGetPartnerBusTypes,
      cache: true,
      loadCache: true,
      callback: callback,
    });
  }

  /**Get Ticket Types
   * @param callback
   * */
  public static getTicketTypes(callback: ApiCallback<TicketTypeListRepsonse>) {
    this.performRequest({
      url: Urls.apiGetTicketTypes,
      cache: true,
      loadCache: true,
      callback: callback,
    });
  }

  /**Get Location Types
   * @param callback
   * */
  public static getLocationTypes(
    callback: ApiCallback<LocationTypeListResponse>
  ) {
    this.performRequest({
      url: Urls.apiGetLocationTypes,
      cache: true,
      loadCache: true,
      callback: callback,
    });
  }

  /**Post Booking verification request
   * @param bookingId
   * @param callback
   * */
  public static verifyUserBooking(
    bookingId: string,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      url: Urls.apiVerifyBooking,
      method: ApiRequestMethod.POST,
      params: {
        booking_id: bookingId,
      },
      encrypt: true,
      callback: callback,
    });
  }

  /**Post Email to retrieve Authorization Url for user
   * @param email
   * @param callback
   * */
  public static processEmailAuthorization(
    email: string,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      url: Urls.apiVerify,
      method: ApiRequestMethod.POST,
      params: {
        email: email,
      },
      encrypt: true,
      cache: false,
      callback: callback,
    });
  }

  /**Post Agent Details
   * @param data
   * @param callback
   * */
  public static addNewAgent(data: any, callback: ApiCallback<BaseResponse>) {
    this.performRequest({
      method: ApiRequestMethod.POST,
      params: data,
      url: Urls.apiUser,
      cache: false,
      callback: callback,
    });
  }

  /**Post trip details
   * @param pickup
   * @param dropoff
   * @param date
   * @param busTypeId
   * @param statusId
   * @param tickets
   * @param callback
   * */
  public static addNewTrip(
    pickupId: number,
    dropoffId: number,
    date: string,
    busTypeId: number,
    statusId: number,
    tickets: any[],
    pickupList: number[],
    dropoffList: number[],
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      method: ApiRequestMethod.POST,
      params: {
        pickupId: pickupId,
        dropoffId: dropoffId,
        date: date,
        busTypeId: busTypeId,
        statusId: statusId,
        tickets: tickets,
        pickupList: tickets,
        dropoffList: tickets,
      },
      url: Urls.apiTrip,
      cache: false,
      callback: callback,
    });
  }

  /**Post ticket details
   * @param ticket
   * @param callback
   * */
  public static addTripTicket(
    ticket: any,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      method: ApiRequestMethod.POST,
      params: ticket,
      url: Urls.apiTicket,
      cache: false,
      callback: callback,
    });
  }

  /**Post Bus details for trip
   * @param tripId
   * @param busId
   * @param callback
   * */
  public static addTripBus(
    tripId: any,
    busId: any,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      method: ApiRequestMethod.POST,
      params: {
        tripId: tripId,
        busId: busId,
      },
      url: Urls.apiTripBus,
      cache: false,
      callback: callback,
    });
  }

  /**Post Location details
   * @param bus
   * @param callback
   * */
  public static addLocation(
    location: any,
    isDefault: boolean,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      method: ApiRequestMethod.POST,
      params: {
        location: location,
        is_default: isDefault,
      },
      url: Urls.apiLocation,
      callback: callback,
    });
  }

  /**Post Bus details
   * @param bus
   * @param callback
   * */
  public static addBus(bus: any, callback: ApiCallback<BaseResponse>) {
    this.performRequest({
      method: ApiRequestMethod.POST,
      params: bus,
      url: Urls.apiBus,
      callback: callback,
    });
  }

  /**Post Bus Image
   * @param formData
   * @param callback
   * */
  public static addBusImage(
    formData: FormData,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      method: ApiRequestMethod.POST,
      params: formData,
      url: Urls.apiBusImage,
      callback: callback,
    });
  }

  /**Post Bus Share Info
   * @param busId
   * @param accountId
   * @param title
   * @param callback
   * */
  public static addSharedBus(
    busId: any,
    accountId: any,
    title: any,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      method: ApiRequestMethod.POST,
      params: {
        busId: busId,
        accountId: accountId,
        title: title,
      },
      url: Urls.apiBusShare,
      callback: callback,
    });
  }

  /**Post Bus Image
   * @param formData
   * @param callback
   * */
  public static addPartnerLogo(
    formData: FormData,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      method: ApiRequestMethod.POST,
      params: formData,
      url: Urls.apiUpdatePartnerLogo,
      callback: callback,
    });
  }

  /**Post Pay-in Request
   * @param payInRequest
   * @param callback
   * */
  public static addPayInRequest(
    payInRequest: any,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      method: ApiRequestMethod.POST,
      params: payInRequest,
      url: Urls.apiPayInRequest,
      encrypt: true,
      callback: callback,
    });
  }

  /**Post Payout Request
   * @param payoutRequest
   * @param callback
   * */
  public static addPayoutRequest(
    payoutRequest: any,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      method: ApiRequestMethod.POST,
      params: payoutRequest,
      url: Urls.apiPayoutRequest,
      encrypt: true,
      callback: callback,
    });
  }

  /**Update Agent Admin Status
   * @param agentId
   * @param remove
   * @param callback
   * */
  public static updateAdminStatus(
    agentId: string,
    remove: number,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      url: Urls.apiAdmin,
      method: ApiRequestMethod.PUT,
      params: {
        agentId: agentId,
        remove: remove,
      },
      cache: false,
      encrypt: true,
      callback: callback,
    });
  }

  /**Update Trip Status
   * @param tripId
   * @param statusId
   * @param callback
   * */
  public static updateTripStatus(
    tripId: any,
    statusId: any,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      url: Urls.apiUpdateTripStatus,
      method: ApiRequestMethod.PUT,
      params: {
        tripId: tripId,
        statusId: statusId,
      },
      cache: false,
      callback: callback,
    });
  }

  /**Update Trip Bus Type
   * @param tripId
   * @param typeId
   * @param callback
   * */
  public static updateTripBusType(
    tripId: any,
    typeId: any,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      url: Urls.apiUpdateTripBusType,
      method: ApiRequestMethod.PUT,
      params: {
        tripId: tripId,
        typeId: typeId,
      },
      cache: false,
      callback: callback,
    });
  }

  /**Update bus
   * @param busId
   * @param callback
   * */
  public static updateBus(
    busId: string,
    description: string,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      url: Urls.apiBus,
      method: ApiRequestMethod.PUT,
      params: {
        busId: busId,
        description: description,
      },
      cache: false,
      callback: callback,
    });
  }


  /**Update Bus Amenity
   * @param busId
   * @param callback
   * */
  public static updateBusAmenity(
    busId: string,
    amenites: any,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      url: Urls.apiBusAmenity,
      method: ApiRequestMethod.PUT,
      params: {
        busId: busId,
        ...amenites,
      },
      cache: false,
      callback: callback,
    });
  }

  /**Delete bus
   * @param busId
   * @param callback
   * */
  public static deleteBus(busId: string, callback: ApiCallback<BaseResponse>) {
    this.performRequest({
      url: Urls.apiBus,
      method: ApiRequestMethod.DELETE,
      params: {
        busId: busId,
      },
      cache: false,
      callback: callback,
    });
  }

  /**Delete Trip
   * @param tripId
   * @param callback
   * */
  public static deleteTrip(
    tripId: string,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      url: Urls.apiTrip,
      method: ApiRequestMethod.DELETE,
      params: {
        tripId: tripId,
      },
      cache: false,
      callback: callback,
    });
  }

  /**
   * Update Location active status
   * @param locId
   * @param is_active
   * @param callback
   * */
  public static updateLocationActiveStatus(
    locId: number,
    is_active: boolean,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      url: Urls.apiLocation,
      method: ApiRequestMethod.PUT,
      params: {
        loc_id: locId,
        is_active: is_active ? 1 : 0,
      },
      cache: false,
      callback: callback,
    });
  }

  /**
   * Update Location Default status
   * @param locId
   * @param is_default
   * @param callback
   * */
  public static updateLocationdDefaultStatus(
    locId: number,
    is_default: boolean,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      url: Urls.apiLocation,
      method: ApiRequestMethod.PUT,
      params: {
        loc_id: locId,
        is_default: is_default ? 1 : 0,
      },
      cache: false,
      callback: callback,
    });
  }

  /**
   * Add pickup location
   * @param tripId
   * @param locId
   * @param callback
   * */
   public static addPickup(
    tripId: any,
    locId: any,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      method: ApiRequestMethod.POST,
      params: {
        tripId: tripId,
        locId: locId,
      },
      url: Urls.apiTripPickupLocation,
      cache: false,
      callback: callback,
    });
  }

  /**Toggle Pickup location
   * @param tripId
   * @param locId
   * @param active
   * @param callback
   * */
  public static togglePickupLocation(
    tripId: number | string,
    locId: number | string,
    active: boolean,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      url: Urls.apiTripPickupLocation,
      method: ApiRequestMethod.PUT,
      params: {
        tripId: tripId,
        locId: locId,
        active: active ? 1 : 0,
      },
      cache: false,
      callback: callback,
    });
  }

  /**Delete Pickup location
   * @param tripId
   * @param locId
   * @param callback
   * */
  public static deletePickupLocation(
    tripId: number | string,
    locId: number | string,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      url: Urls.apiTripPickupLocation,
      method: ApiRequestMethod.DELETE,
      params: {
        tripId: tripId,
        locId: locId,
      },
      cache: false,
      callback: callback,
    });
  }

  /**
   * Add dropoff location
   * @param tripId
   * @param locId
   * @param callback
   * */
   public static addDropoff(
    tripId: any,
    locId: any,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      method: ApiRequestMethod.POST,
      params: {
        tripId: tripId,
        locId: locId,
      },
      url: Urls.apiTripDropoffLocation,
      cache: false,
      callback: callback,
    });
  }

  /**Toggle Dropoff location
   * @param tripId
   * @param locId
   * @param active
   * @param callback
   * */
  public static toggleDropoffLocation(
    tripId: number | string,
    locId: number | string,
    active: boolean,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      url: Urls.apiTripDropoffLocation,
      method: ApiRequestMethod.PUT,
      params: {
        tripId: tripId,
        locId: locId,
        active: active ? 1 : 0,
      },
      cache: false,
      callback: callback,
    });
  }

  /**Delete Dropoff location
   * @param tripId
   * @param locId
   * @param callback
   * */
  public static deleteDropoffLocation(
    tripId: number | string,
    locId: number | string,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      url: Urls.apiTripDropoffLocation,
      method: ApiRequestMethod.DELETE,
      params: {
        tripId: tripId,
        locId: locId,
      },
      cache: false,
      callback: callback,
    });
  }

  /**Toggle Ticket
   * @param ticketId
   * @param typeId
   * @param active
   * @param callback
   * */
  public static toggleTicket(
    ticketId: number | string,
    typeId: number | string,
    active: boolean,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      url: Urls.apiTicketToggle,
      method: ApiRequestMethod.POST,
      params: {
        ticketId: ticketId,
        typeId: typeId,
        active: active ? 1 : 0,
      },
      cache: false,
      callback: callback,
    });
  }

  /**Togle Agent
   * @param agentId
   * @param active
   * @param callback
   * */
  public static toggleAgent(
    agentId: string,
    active: boolean,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      method: ApiRequestMethod.POST,
      params: {
        agentId: agentId,
        active: active ? 1 : 0,
      },
      url: Urls.apiUserToggle,
      cache: false,
      encrypt: true,
      callback: callback,
    });
  }

  /**Reserve TripSeat
   * @param tripId
   * @param seatId
   * @param toggle
   * @param callback
   * */
  public static researveSeat(
    tripId: string,
    seatId: string,
    toggle: boolean,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      url: Urls.apiTripReserve,
      method: ApiRequestMethod.POST,
      params: {
        tripId: tripId,
        seatId: seatId,
        toggle: toggle ? 1 : 0,
      },
      cache: false,
      callback: callback,
    });
  }

  /**Delete Trip
   * @param tripId
   * @param busId
   * @param callback
   * */
  public static deleteTripBus(
    tripId: string,
    busId: string,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      url: Urls.apiTripBus,
      method: ApiRequestMethod.DELETE,
      params: {
        tripId: tripId,
        busId: busId,
      },
      cache: false,
      callback: callback,
    });
  }

  /**Delete Bus Image
   * @param busId
   * @param imageId
   * @param callback
   * */
  public static deleteBusImage(
    busId: string,
    imageId: string,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      method: ApiRequestMethod.DELETE,
      params: {
        busId: busId,
        imageId: imageId,
      },
      url: Urls.apiBusImage,
      cache: false,
      callback: callback,
    });
  }

  /**Delete Share bus
   * @param busId
   * @param imageId
   * @param callback
   * */
  public static deleteSharedBus(
    busId: string,
    partnerId: string,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      method: ApiRequestMethod.DELETE,
      params: {
        busId: busId,
        partnerId: partnerId,
      },
      url: Urls.apiBusShare,
      cache: false,
      callback: callback,
    });
  }

  /**Delete Agent
   * @param agentId
   * @param callback
   * */
  public static deleteAgent(
    agentId: string,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      method: ApiRequestMethod.DELETE,
      params: {
        agentId: agentId,
      },
      url: Urls.apiUser,
      cache: false,
      encrypt: true,
      callback: callback,
    });
  }

  /**Delete Location
   * @param locId
   * @param active
   * @param callback
   * */
  public static deleteLocation(
    locId: number,
    callback: ApiCallback<BaseResponse>
  ) {
    this.performRequest({
      url: Urls.apiLocation,
      method: ApiRequestMethod.DELETE,
      params: {
        loc_id: locId,
      },
      cache: false,
      callback: callback,
    });
  }
}
