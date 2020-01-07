import {Urls} from "./Urls";
import {
    BookingInfoObject,
    BusesInfoObject,
    BusInfoObject,
    BusTypeObject,
    DashboardObject,
    LocationTypeObject,
    SimpleResponseObject,
    TicketTypesObject,
    TripInfoObject,
    TripsInfoObject,
    TripStatusObject,
    UserInfoObject,
    UsersObject,
    ValidateSessionObject,
    BookingsInfoObject,
    PayInTransactionObject,
    PayOutTransactionObject
} from "../models/ApiResponse";
import {Utils, ToastType} from "./Utils";
import {SessionManager} from "./SessionManager";
import {NetworkProvider} from "./NetworkProvider";
import {Strings} from "../resources";
import {OauthRequestMethod, OauthStorage} from "./Oauth";
import {CIPHER} from "./CIPHER";
import {HttpResponse} from "@angular/common/http";
import * as CryptoJS from "crypto-js";


/**Define the types of Api Responses*/
export enum ApiResponseType {
    Api_Success,
    Api_Error,
    Authorization_error,
    Network_error,
    unknown
}

/**Define the Api Request Params*/
interface ApiRequestParams {
    url: string;
    method?: OauthRequestMethod;
    headers?: {[key in string]: any};
    params?: {[key in string]: any};
    encrypt?: boolean,
    cache?: boolean,
    cacheId?: string,
    loadCache?: boolean,
    callback?: (status: boolean, result: any, responseType: ApiResponseType) => any
}

/**Put All Api requests here so it can be
 * reused globally whenever needed
 * */
export class Api {

    private cacheLoaded = false;

    /**
     * This Performs the request and returns the results
     * @param {ApiRequestParams} requestParams
     */
    private static performRequest(
        requestParams: ApiRequestParams =
            {url: null, method: OauthRequestMethod.GET, params: null, encrypt: false, cache: false, cacheId:null, loadCache:false, callback: null}) {
        new Api(requestParams)
    }

    /**Secure access token
     *
     * @return {string}
     */
    private secureToken (requestParams:ApiRequestParams){
        if (requestParams.encrypt && requestParams.method != OauthRequestMethod.GET && requestParams.params) {
            let method = String(requestParams.method).toLowerCase();
            let data = requestParams.params;
            let path = requestParams.url;
            if (URL) {
                let u = new URL(path);
                path = u.origin + u.pathname;
            }
            let cnonce = CryptoJS.MD5(Utils.toJson(data));
            let A1 = OauthStorage.accessToken;
            let A2 = CryptoJS.MD5(`${method}:${path}`);
            let integrity = CryptoJS.MD5(`${A1}:${cnonce}:${A2}`);
            return OauthStorage.tokenType+' '+CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(OauthStorage.accessToken+'/'+integrity));
        }
        else {
            return OauthStorage.tokenType+' '+OauthStorage.accessToken;
        }
    }


    /**
     * Constructor
     * @param {ApiRequestParams} requestParams
     */
    private constructor(requestParams: ApiRequestParams) {

        if (!requestParams.cacheId){
            requestParams.cacheId = String(Utils.hashString(requestParams.url))
        }

        if (NetworkProvider.isOnline()) {

            /**Get Session Token First*/
            SessionManager.getSession(session => {

                if (requestParams.headers == null)
                    requestParams.headers = [];

                requestParams.headers["X-Session-Token"] = session != null ? session.session_token : "";
                if (requestParams.encrypt) {
                    if (session != null) {
                        CIPHER.encrypt(session.encryption_key, Utils.toJson(requestParams.params), (status, cipher) => {
                            if (status) {
                                requestParams.params = {
                                    data: cipher
                                };
                                requestParams.headers["X-Encrypted"] = '1';
                                this.processRequest(requestParams, true, session.encryption_key)
                            }
                            else {
                                this.processRequest(requestParams, false)
                            }
                        })
                    }
                    else {
                        this.processRequest(requestParams, false)
                    }
                }
                else {
                    this.processRequest(requestParams, false)
                }
            });
        }
        else {
            if (requestParams.callback)
                requestParams.callback(false, Strings.getString("error_connection"), ApiResponseType.Network_error);
        }
    }

    /**
     * Process Api Request
     * @param requestParams 
     * @param encryptedRequest 
     * @param encryptionKey 
     */
    private processRequest(requestParams: ApiRequestParams, encryptedRequest: boolean, encryptionKey?:string) {
        let processWithMethod = () => {
            switch (requestParams.method) {
                case OauthRequestMethod.DELETE:
                    // return OauthRequest.delete(req);
                    return NetworkProvider.getInstance().httpClient.delete(requestParams.url,{
                        headers: requestParams.headers,
                        params: requestParams.params,
                        observe: 'response',
                        responseType: 'text'
                    });
                case OauthRequestMethod.PUT:
                    // return OauthRequest.put(req);
                    return NetworkProvider.getInstance().httpClient.put(requestParams.url,requestParams.params,{
                        headers: requestParams.headers,
                        observe: 'response',
                        responseType: 'text'
                    });
                case OauthRequestMethod.POST:
                    // return OauthRequest.post(req);
                    return NetworkProvider.getInstance().httpClient.post(requestParams.url,requestParams.params,{
                        headers: requestParams.headers,
                        observe: 'response',
                        responseType: 'text'
                    });
                case OauthRequestMethod.GET:
                default:
                    // return OauthRequest.get(req);
                    return NetworkProvider.getInstance().httpClient.get(requestParams.url,{
                        observe: 'response',
                        responseType: 'text',
                        headers: requestParams.headers,
                        params: requestParams.params,
                    });

            }
        };

        /*Respond first from cache*/
        if (requestParams.cache && requestParams.loadCache) {

            //get cached response
            SessionManager.get(requestParams.cacheId, data => {
                if (data) {
                    if (requestParams.callback) {
                        requestParams.callback(true, data, ApiResponseType.Api_Success);
                        this.cacheLoaded = true;
                    }
                }
            });
        }

        /*Process Request*/
        requestParams.headers["Authorization"] =  this.secureToken(requestParams);
        processWithMethod().subscribe(result => {
            let encryptedResponse = result.headers.get('X-Encrypted')  == "1";
            if (encryptedResponse){ // If Response is Encrypted
                let integrity = result.headers.get('X-Integrity');
                if(this.verifyIntegrity(result.body, integrity, encryptionKey)){ //Verify Integrity of response
                    CIPHER.decrypt(encryptionKey,result.body,(status, plain) => {
                        if (status){
                            this.processResponse(true,{
                                ok:result.ok,
                                status:result.status,
                                statusText:result.statusText,
                                clone:result.clone,
                                type:result.type,
                                url:result.url,
                                headers:result.headers,
                                body:plain,
                            },requestParams);
                        }
                        else {
                            if (!this.cacheLoaded) {
                                requestParams.callback(false, Strings.getString("error_unexpected"), ApiResponseType.unknown);
                            }
                        }
                    })
                }
                else {
                    if (!this.cacheLoaded) {
                        requestParams.callback(false, Strings.getString("error_unexpected"), ApiResponseType.unknown);
                    }
                }
            }
            else {
                this.processResponse(result.ok,result,requestParams);
            }
        }, err => {
            this.processResponse(false,err,requestParams);
        });
    }

    /**
     * Process Api Response
     * @param status 
     * @param result 
     * @param requestParams 
     */
    private processResponse(status:boolean, result:HttpResponse<any>, requestParams:ApiRequestParams){
        if (result) {
            if (status) {
                let data = Utils.parseJson(result.body);
                if (data) {
                    if (data.status) {
                        if (requestParams.cache) {

                            //get cached response
                            SessionManager.get(requestParams.cacheId, cachedData => {
                                if (cachedData) {

                                    //Compare new response to cached response
                                    if (Utils.toJson(cachedData)!=Utils.toJson(data)) {
                                        if (requestParams.callback)
                                            requestParams.callback(true, data, ApiResponseType.Api_Success);
                                        SessionManager.set(requestParams.cacheId, data); //cache response
                                    }
                                    else {
                                        if (!this.cacheLoaded){
                                            if (requestParams.callback)
                                                requestParams.callback(true, data, ApiResponseType.Api_Success);
                                        }
                                    }
                                }
                                else {
                                    if (requestParams.callback)
                                        requestParams.callback(true, data, ApiResponseType.Api_Success);
                                    SessionManager.set(requestParams.cacheId, data); //cache response
                                }
                            });
                        }
                        else {
                            if (requestParams.callback)
                                requestParams.callback(true, data, ApiResponseType.Api_Success);
                        }

                    } else {
                        if (Utils.assertAvailable(data.msg)) {
                            if (requestParams.callback)
                                requestParams.callback(false, data.msg, ApiResponseType.Api_Error);
                        } else {
                            if (requestParams.callback)
                                requestParams.callback(false, Strings.getString("error_unexpected"), ApiResponseType.Api_Error);
                        }
                        SessionManager.remove(requestParams.cacheId) //remove cache
                    }
                } else {
                    requestParams.callback(false, Strings.getString("error_unexpected"), ApiResponseType.unknown);
                    SessionManager.remove(requestParams.cacheId) //remove cache
                }
            }
            else {
                if (result.status === 401 || result.status === 403) { //Failed to authorize api access
                    if (requestParams.callback)
                                requestParams.callback(false, Strings.getString("error_access_expired"), ApiResponseType.Authorization_error);                  
                }
                else {
                    if (requestParams.cache) {
                        //get cached response
                        SessionManager.get(requestParams.cacheId, data => {
                            if (data) {
                                if (requestParams.callback)
                                    requestParams.callback(true, data, ApiResponseType.Api_Success);
                            }
                            else {
                                if (!this.cacheLoaded) {
                                    if (requestParams.callback)
                                        requestParams.callback(false, Utils.assertAvailable(data) && Utils.assertAvailable(data.msg) ?
                                            data.msg :
                                            Strings.getString("error_unexpected"), ApiResponseType.unknown);
                                }
                            }
                        });
                    }
                    else {
                        if (!this.cacheLoaded) {
                            let data = Utils.parseJson(result.body);
                            if (requestParams.callback)
                                requestParams.callback(false, Utils.assertAvailable(data) && Utils.assertAvailable(data.msg) ?
                                    data.msg :
                                    Strings.getString("error_unexpected"), ApiResponseType.unknown);
                        }
                    }
                }
            }
        }
        else{
            if (!this.cacheLoaded) {
                if (requestParams.callback)
                    requestParams.callback(false, Strings.getString("error_unexpected"), ApiResponseType.unknown);
            }
        }
    }

    /** 
     * Verify integrity of response
     * @param data string data gotten from response
     * @param x_integrity string integrity of data to be compared with
     * @param key string Encryption key
     * */
    private verifyIntegrity (data:string, x_integrity:string, key:string)
    {
        return x_integrity === CIPHER.getDigest(data, CryptoJS.MD5(key).toString());
    }



    /*----------------------- API FUNCTIONS ---------------------*/

    /**Initialize api session
     * @param data
     * @param callback
     * */
    public static initialize(data: {
        agent?: string,
        os: string,
        version: string,
        app_name: string,
        device_type: string,
        device_name: string
    }, callback: (status: boolean, result: ValidateSessionObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiInitialize,
            method: OauthRequestMethod.POST,
            params: data,
            cache:false,
            callback: callback
        })
    }

    /**Set Current Country
     * @param country_code
     * @param callback
     * */
    public static setCountry(country_code: string, callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            method: OauthRequestMethod.POST,
            params: {
                country:country_code
            },
            url: Urls.apiCountry,
            cache: false,
            callback: callback
        })
    }

    /**Set Current Language
     * @param lang_code
     * @param callback
     * */
    public static setLanguage(lang_code: string, callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            method: OauthRequestMethod.POST,
            params: {
                lang:lang_code
            },
            url: Urls.apiLanguage,
            cache: false,
            callback: callback
        })
    }


    /**Logout Users
     * @param callback
     * */
    public static logout(callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiLogout,
            method: OauthRequestMethod.GET,
            callback: callback
        })
    }


    /**Get User Data
     * @param callback
     * */
    public static getUserInfo(callback: (status: boolean, result: UserInfoObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiUser,
            callback: callback
        })
    }

    /**Get Agents Data
     * @param callback
     * @param loadCache
     * */
    public static getAgents(callback: (status: boolean, result: UsersObject | string | any, responseType: ApiResponseType) => any, loadCache = true) {
        this.performRequest({
            url: Urls.apiGetAgents,
            cache:true,
            loadCache:loadCache,
            callback: callback
        })
    }

    /**Get trip info
     * @param tripId
     * @param callback
     * */
    public static getTrip(tripId: string, callback: (status: boolean, result: TripInfoObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiTrip,
            params: {
                tripId: tripId
            },
            cache:true,
            loadCache:true,
            callback: callback
        })
    }

    /**Get agent trip list
     * @param callback
     * */
    public static getTrips(callback: (status: boolean, result: TripsInfoObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiTrips,
            cache:true,
            loadCache:true,
            callback: callback
        })
    }

    /**Get bus
     * @param busId
     * @param callback
     * */
    public static getBus(busId: string, callback: (status: boolean, result: BusInfoObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiBus,
            params: {
                busId: busId
            },
            cache:true,
            loadCache:true,
            callback: callback
        })
    }

    /**Get bus lists
     * @param callback
     * */
    public static getBuses(callback: (status: boolean, result: BusesInfoObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiBuses,
            cache:true,
            loadCache:true,
            callback: callback
        })
    }


    /**Get bus lists
     * @param typeId
     * @param callback
     * */
    public static getBusesForType(typeId: any, callback: (status: boolean, result: BusesInfoObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiBuses,
            params: {
                typeId: typeId
            },
            cache:true,
            loadCache:true,
            callback: callback
        })
    }


    /**Get Active trips for booking
     * @param minDate
     * @param maxDate
     * @param callback
     * */
    public static getDashboard(minDate, maxDate, callback: (status: boolean, result: DashboardObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiGetDashboard,
            cache:true,
            loadCache:false,
            params:{
              min_date: minDate,
              max_date: maxDate,
            },
            cacheId:String(Utils.hashString(Urls.apiGetDashboard+minDate+maxDate)),
            callback: callback
        })
    }
    

    /**Get Payin Transactions
     * @param callback
     * */
    public static getPayInTransactions(callback: (status: boolean, result: PayInTransactionObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiGetPayin,
            cache:true,
            callback: callback
        })
    }


    /**Get Payout Transactions
     * @param callback
     * */
    public static getPayOutTransactions(callback: (status: boolean, result: PayOutTransactionObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiGetPayout,
            cache:true,
            callback: callback
        })
    }


    /**Get Booking list
     * @param callback
     * */
    public static getBookings(callback: (status: boolean, result: BookingsInfoObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiGetBookings,
            cache:true,
            callback: callback
        })
    }

    /**Get Booking Data
     * @param referenceCode
     * @param callback
     * */
    public static getBookingInfo(referenceCode: string, callback: (status: boolean, result: BookingInfoObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            params: {
                reference_code: referenceCode
            },
            url: Urls.apiGetBookingInfo,
            cache:true,
            cacheId:String(Utils.hashString(Urls.apiGetBookingInfo+referenceCode)),
            callback: callback
        })
    }

    /**Get Trip Status List for new trips
     * @param callback
     * */
    public static getTripStatusList(callback: (status: boolean, result: TripStatusObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiGetTripsNewStatusList,
            cache:true,
            loadCache:true,
            callback: callback
        })
    }


    /**Get All Status List
     * @param callback
     * */
    public static getAllStatusList(callback: (status: boolean, result: TripStatusObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiGetTripsAllStatusList,
            cache:true,
            loadCache:true,
            callback: callback
        })
    }


    /**Get All Bus Types
     * @param callback
     * */
    public static getBusTypes(callback: (status: boolean, result: BusTypeObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiGetBusTypes,
            cache:true,
            loadCache:true,
            callback: callback
        })
    }

    /**Get Partner Bus Types
     * @param callback
     * */
    public static getPartnerBusTypes(callback: (status: boolean, result: BusTypeObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiGetPartnerBusTypes,
            cache:true,
            loadCache:true,
            callback: callback
        })
    }

    /**Get Ticket Types
     * @param callback
     * */
    public static getTicketTypes(callback: (status: boolean, result: TicketTypesObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiGetTicketTypes,
            cache:true,
            loadCache:true,
            callback: callback
        })
    }

    /**Get Location Types
     * @param callback
     * */
    public static getLocationTypes(callback: (status: boolean, result: LocationTypeObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiGetLocationTypes,
            cache:true,
            loadCache:true,
            callback: callback
        })
    }

    /**Post Booking verification request
     * @param bookingId
     * @param callback
     * */
    public static verifyUserBooking(bookingId: string, callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            method: OauthRequestMethod.POST,
            params: {
                booking_id: bookingId
            },
            url: Urls.apiVerifyBooking,
            encrypt: true,
            callback: callback
        })
    }

    /**Post Email to retrieve Authorization Url for user
     * @param email
     * @param callback
     * */
    public static processEmailAuthorization(email: string, callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiVerify,
            method: OauthRequestMethod.POST,
            params: {
                email: email,
            },
            encrypt: true,
            cache: false,
            callback: callback
        })
    }

    /**Post Agent Details
     * @param data
     * @param callback
     * */
    public static addNewAgent(data: any, callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            method: OauthRequestMethod.POST,
            params: data,
            url: Urls.apiUser,
            cache: false,
            callback: callback
        })
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
    public static addNewTrip(pickup: any, dropoff: any, date: string, busTypeId: number, statusId: number, tickets: any, callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            method: OauthRequestMethod.POST,
            params: {
                pickup: pickup,
                dropoff: dropoff,
                date: date,
                busTypeId: busTypeId,
                statusId: statusId,
                tickets: tickets,
            },
            url: Urls.apiTrip,
            cache: false,
            callback: callback
        })
    }

    /**Post ticket details
     * @param ticket
     * @param callback
     * */
    public static addTripTicket(ticket: any, callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            method: OauthRequestMethod.POST,
            params: ticket,
            url: Urls.apiTicket,
            cache: false,
            callback: callback
        })
    }

    /**Post Bus details for trip
     * @param tripId
     * @param busId
     * @param callback
     * */
    public static addTripBus(tripId: any, busId: any, callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            method: OauthRequestMethod.POST,
            params: {
                tripId: tripId,
                busId: busId,
            },
            url: Urls.apiTripBus,
            cache: false,
            callback: callback
        })
    }


    /**Post Bus details
     * @param bus
     * @param callback
     * */
    public static addBus(bus: any, callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            method: OauthRequestMethod.POST,
            params: bus,
            url: Urls.apiBus,
            callback: callback
        })
    }

    /**Post Bus Image
     * @param formData
     * @param callback
     * */
    public static addBusImage(formData: FormData, callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            method: OauthRequestMethod.POST,
            params: formData,
            url: Urls.apiBusImage,
            callback: callback
        })
    }


    /**Post Bus Image
     * @param formData
     * @param callback
     * */
    public static addPartnerLogo(formData: FormData, callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            method: OauthRequestMethod.POST,
            params: formData,
            url: Urls.apiUpdatePartnerLogo,
            callback: callback
        })
    }




    /**Post Pay-in Request
     * @param payInRequest
     * @param callback
     * */
    public static addPayInRequest(payInRequest: any, callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            method: OauthRequestMethod.POST,
            params: payInRequest,
            url: Urls.apiPayInRequest,
            encrypt: true,
            callback: callback
        })
    }


    /**Post Payout Request
     * @param payoutRequest
     * @param callback
     * */
    public static addPayoutRequest(payoutRequest: any, callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            method: OauthRequestMethod.POST,
            params: payoutRequest,
            url: Urls.apiPayoutRequest,
            encrypt: true,
            callback: callback
        })
    }


    /**Update Agent Admin Status
     * @param agentId
     * @param remove
     * @param callback
     * */
    public static updateAdminStatus(agentId: string, remove: number, callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiAdmin,
            method: OauthRequestMethod.PUT,
            params: {
                agentId: agentId,
                remove: remove,
            },
            cache: false,
            encrypt: true,
            callback: callback
        })
    }


    /**Update Trip Status
     * @param tripId
     * @param statusId
     * @param callback
     * */
    public static updateTripStatus(tripId: any, statusId: any, callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiUpdateTripStatus,
            method: OauthRequestMethod.PUT,
            params: {
                tripId: tripId,
                statusId: statusId,
            },
            cache: false,
            callback: callback
        })
    }


    /**Update Trip Bus Type
     * @param tripId
     * @param typeId
     * @param callback
     * */
    public static updateTripBusType(tripId: any, typeId: any, callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiUpdateTripBusType,
            method: OauthRequestMethod.PUT,
            params: {
                tripId: tripId,
                typeId: typeId,
            },
            cache: false,
            callback: callback
        })
    }

    /**Delete bus
     * @param busId
     * @param callback
     * */
    public static deleteBus(busId: string, callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiBus,
            method: OauthRequestMethod.DELETE,
            params: {
                busId: busId
            },
            cache: false,
            callback: callback
        })
    }

    /**Delete Trip
     * @param tripId
     * @param callback
     * */
    public static deleteTrip(tripId: string, callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiTrip,
            method: OauthRequestMethod.DELETE,
            params: {
                tripId: tripId
            },
            cache: false,
            callback: callback
        })
    }

    /**Toggle Ticket
     * @param ticketId
     * @param typeId
     * @param active
     * @param callback
     * */
    public static toggleTicket(ticketId: string, typeId: string, active:boolean, callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiTicketToggle,
            method: OauthRequestMethod.POST,
            params: {
                ticketId: ticketId,
                typeId: typeId,
                active: active,
            },
            cache: false,
            callback: callback
        })
    }

    /**Delete Trip
     * @param tripId
     * @param busId
     * @param callback
     * */
    public static deleteTripBus(tripId: string, busId: string, callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            url: Urls.apiTripBus,
            method: OauthRequestMethod.DELETE,
            params: {
                tripId: tripId,
                busId: busId,
            },
            cache: false,
            callback: callback
        })
    }

    /**Delete Bus Image
     * @param busId
     * @param imageId
     * @param callback
     * */
    public static deleteBusImage(busId: string, imageId: string, callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            method: OauthRequestMethod.DELETE,
            params: {
                busId: busId,
                imageId: imageId
            },
            url: Urls.apiBusImage,
            cache: false,
            callback: callback
        })
    }

    /**Delete Agent
     * @param agentId
     * @param callback
     * */
    public static deleteAgent(agentId: string, callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            method: OauthRequestMethod.DELETE,
            params: {
                agentId: agentId
            },
            url: Urls.apiUser,
            cache: false,
            encrypt:true,
            callback: callback
        })
    }

    /**Togle Agent
     * @param agentId
     * @param active
     * @param callback
     * */
    public static toggleAgent(agentId: string, active: boolean|number, callback: (status: boolean, result: SimpleResponseObject | string | any, responseType: ApiResponseType) => any) {
        this.performRequest({
            method: OauthRequestMethod.POST,
            params: {
                agentId: agentId,
                active: active
            },
            url: Urls.apiUserToggle,
            cache: false,
            encrypt:true,
            callback: callback
        })
    }

}