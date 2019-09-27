
export class Oauth {

    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly authorizeUrl: string;
    private readonly tokenUrl: string;
    private readonly verifyTokenUrl: string;

    /**@param data object
     * @param data.clientId - Your Application's Client ID
     * @param data.clientSecret - Your Application's Client Secret
     * @param data.authorizeUrl - Url to Authorize access (For authorization_code grant_type)
     * @param data.tokenUrl - Url to obtain token
     * @param data.verifyTokenUrl - Url to verify token
     * */
    constructor(data: {
        clientId?: string,
        clientSecret?: string,
        authorizeUrl?: string,
        tokenUrl?: string,
        verifyTokenUrl?: string
    }) {

        if (OauthUtils.assertAvailable(data.clientId)) {
            this.clientId = data.clientId;
        }
        else {
            throw "'clientId' Required"
        }

        if (OauthUtils.assertAvailable(data.clientSecret)) {
            this.clientSecret = data.clientSecret;
        }
        else {
            throw "'clientSecret' Required"
        }

        if (OauthUtils.assertAvailable(data.authorizeUrl)) {
            this.authorizeUrl = data.authorizeUrl;
        }
        else {
            throw "'authorizeUrl'  Required"
        }

        if (OauthUtils.assertAvailable(data.tokenUrl)) {
            this.tokenUrl = data.tokenUrl;
        }
        else {
            throw "'tokenUrl' Required"
        }

        if (OauthUtils.assertAvailable(data.verifyTokenUrl)) {
            this.verifyTokenUrl = data.verifyTokenUrl;
        }
        else {
            throw "'verifyTokenUrl' Required"
        }
    }


    /**Authorize Access to the app
     * @param params Object
     * @param params.grant_type default -> client_credentials grantType
     * @param params.ignore_grant_types grant_type(s) to ignore if OauthGrantType.Auto selected
     * @param params.redirect_uri For authorization_code grant_type default -> current url
     * @param params.user_id For authorization_code grant_type
     * @param params.username For User_Credentials grant_type
     * @param params.password For User_Credentials grant_type
     * @param params.callback()
     * */
    authorizeAccess(params: {
        grant_type?: OauthGrantType,
        ignore_grant_types?: OauthGrantType[],
        redirect_uri?: string,
        user_id?: string,
        username?: string,
        password?: string,
        state?: string,
        scope?: string[],
        callback?: (token: string | boolean,msg?:string) => any,
    }) {

        let grant_type: OauthGrantType = OauthUtils.assertAvailable(params.grant_type) ?
            params.grant_type :
            OauthGrantType.Client_Credentials;
        let ignore_grant_types: OauthGrantType[] = OauthUtils.assertAvailable(params.ignore_grant_types) ?
            params.ignore_grant_types :
            [];
        let redirect_uri: string = OauthUtils.assertAvailable(params.redirect_uri) ?
            params.redirect_uri :
            OauthUtils.stripUrlParams(location.origin);
        let scope: string[] = OauthUtils.assertAvailable(params.scope) ?
            params.scope :
            [];
        let state: string = OauthUtils.assertAvailable(params.state) ?
            params.state :
            OauthUtils.generateKey(32);

        /**Get New Token
         * */
        let getNewOauthToken = () => {
            switch (grant_type) {
                case OauthGrantType.Auto:
                    if (OauthUtils.assertAvailable(params.user_id) || OauthUtils.assertAvailable(OauthUtils.getUrlParam('code'))) { //if authorization code exists in url param
                        grant_type = OauthGrantType.Authorization_Code;
                        if (!ignore_grant_types.includes(grant_type)) {
                            getNewOauthToken()
                        } else {
                            params.callback(false);
                        }
                    }
                    else if(OauthUtils.assertAvailable(params.username) && OauthUtils.assertAvailable(params.password)) {
                        grant_type = OauthGrantType.User_Credentials;
                        if (!ignore_grant_types.includes(grant_type)) {
                            getNewOauthToken()
                        } else {
                            params.callback(false);
                        }
                    }
                    else {
                        grant_type = OauthGrantType.Client_Credentials;
                        if (!ignore_grant_types.includes(grant_type)) {
                            getNewOauthToken()
                        } else {
                            params.callback(false);
                        }
                    }
                    break;
                case OauthGrantType.Authorization_Code:

                    let code = OauthUtils.getUrlParam('code');
                    let error = OauthUtils.getUrlParam('error');
                    let error_description = OauthUtils.getUrlParam('error_description');
                    if (OauthUtils.assertAvailable(code)) //if authorization code exists in url param
                    {
                        let save_state = OauthStorage.getData("oauth_state");
                        state = OauthUtils.assertAvailable(save_state)?save_state:state;
                        if (state === OauthUtils.getUrlParam('state')) //csrf verification
                        {
                            //Get token
                            this.oauthTokenWithAuthorizationCode(code, redirect_uri,
                                /**Ajax Response callback
                                 * @param token OauthTokenResponse
                                 * @param xhr XMLHttpRequest | ActiveXObject
                                 * */
                                (token, xhr) => {
                                    if (OauthUtils.assertAvailable(token)) {
                                        if (OauthUtils.assertAvailable(token.accessToken)) {

                                            //Remove instance ID
                                            OauthStorage.removeData("oauth_state");

                                            //save token
                                            OauthStorage.saveAccess(token);

                                            if (typeof params.callback === 'function') {
                                                params.callback(OauthStorage.accessToken);
                                            }

                                            //Remove authorization code from url
                                            location.replace(OauthUtils.stripUrlParams(window.location.href));
                                        }
                                        else if (OauthUtils.assertAvailable(token.error)){
                                            if (typeof params.callback === 'function') {
                                                params.callback(false,token.errorDescription);
                                            }
                                        }
                                        else{
                                            if (typeof params.callback === 'function') {
                                                params.callback(false);
                                            }
                                        }
                                    }
                                    else {
                                        if (typeof params.callback === 'function') {
                                            params.callback(false);
                                        }
                                    }
                                })
                        }
                        else {
                            if (typeof params.callback === 'function') {
                                params.callback(false,"Failed authorize access. CSRF Verification Failed");
                            }
                        }
                    }
                    else if (OauthUtils.assertAvailable(error)) {

                        //Remove oauth state
                        OauthStorage.removeData("oauth_state");

                        if (OauthUtils.assertAvailable(error_description)) {
                            if (typeof params.callback === 'function') {
                                params.callback(false,error_description);
                            }
                        }
                        else {
                            if (typeof params.callback === 'function') {
                                params.callback(false,"Failed authorize access");
                            }
                        }
                    }
                    else {
                        //Get authorization code
                        this.oauthAuthorize(scope, redirect_uri, params.user_id, state);
                    }
                    break;
                case OauthGrantType.User_Credentials:

                    //Get token
                    this.oauthTokenWithUserCredentials(params.username, params.password,scope,
                        /**Ajax Response callback
                         * @param token OauthTokenResponse
                         * @param xhr XMLHttpRequest | ActiveXObject
                         * */
                        (token, xhr) => {
                            if (OauthUtils.assertAvailable(token)) {
                                if (OauthUtils.assertAvailable(token.accessToken)) {

                                    //save token
                                    OauthStorage.saveAccess(token);

                                    if (typeof params.callback === 'function') {
                                        params.callback(OauthStorage.accessToken);
                                    }
                                }
                                else if (OauthUtils.assertAvailable(token.error)){
                                    if (typeof params.callback === 'function') {
                                        params.callback(false,token.errorDescription);
                                    }
                                }
                                else{
                                    if (typeof params.callback === 'function') {
                                        params.callback(false);
                                    }
                                }
                            }
                            else {
                                if (typeof params.callback === 'function') {
                                    params.callback(false);
                                }
                            }
                        });
                    break;
                case OauthGrantType.Client_Credentials:
                default:

                    //Get token
                    this.oauthTokenWithClientCredentials(
                        /**Ajax Response callback
                         * @param token OauthTokenResponse
                         * @param xhr XMLHttpRequest | ActiveXObject
                         * */
                        (token, xhr) => {
                            if (OauthUtils.assertAvailable(token)) {
                                if (OauthUtils.assertAvailable(token.accessToken)) {

                                    //save token
                                    OauthStorage.saveAccess(token);

                                    if (typeof params.callback === 'function') {
                                        params.callback(OauthStorage.accessToken);
                                    }
                                }
                                else if (OauthUtils.assertAvailable(token.error)){
                                    if (typeof params.callback === 'function') {
                                        params.callback(false,token.errorDescription);
                                    }
                                }
                                else{
                                    if (typeof params.callback === 'function') {
                                        params.callback(false);
                                    }
                                }
                            }
                            else {
                                if (typeof params.callback === 'function') {
                                    params.callback(false);
                                }
                            }
                        });
                    break;
            }
        };

        /**Refresh Existing Token
         * @param refreshToken String
         * */
        let refreshOauthToken = (refreshToken) => {

            this.oauthRefreshToken(refreshToken,
                /**Ajax Response callback
                 * @param token OauthTokenResponse
                 * @param xhr XMLHttpRequest | ActiveXObject
                 * */
                (token, xhr) => {
                    if (OauthUtils.assertAvailable(token)) {
                        if (OauthUtils.assertAvailable(token.accessToken)) {

                            //save token
                            OauthStorage.saveAccess(token);

                            if (typeof params.callback === 'function') {
                                params.callback(OauthStorage.accessToken);
                            }
                        }
                        else if (OauthUtils.assertAvailable(token.error)){
                            if (typeof params.callback === 'function') {
                                params.callback(false,token.errorDescription);
                            }
                        }
                        else{
                            if (typeof params.callback === 'function') {
                                params.callback(false);
                            }
                        }
                    }
                    else {
                        if (typeof params.callback === 'function') {
                            params.callback(false);
                        }
                    }
                });
        };

        if (OauthUtils.assertAvailable(OauthUtils.getUrlParam('access_token'))){
            let accessToken = OauthUtils.getUrlParam('access_token');
            //Verify current token
            this.oauthVerifyToken(accessToken,
                /**Ajax Response callback
                 * @param verify OauthVerificationResponse
                 * @param xhr XMLHttpRequest | ActiveXObject
                 * */
                (verify, xhr) => {
                    if (OauthUtils.assertAvailable(verify)) {
                        if (OauthUtils.assertAvailable(verify.success)) {
                            if (verify.success == true) {
                                if (typeof params.callback === 'function') {
                                    OauthStorage.accessToken = accessToken;
                                    params.callback(OauthUtils.assertAvailable(accessToken)?accessToken:true);
                                }
                            }
                            else {
                                if (typeof params.callback === 'function') {
                                    params.callback(false);
                                }
                            }
                        } else {
                            if (typeof params.callback === 'function') {
                                params.callback(false);
                            }
                        }
                    }
                    else {
                        if (typeof params.callback === 'function') {
                            params.callback(false);
                        }
                    }
                });
        }
        else {
            let accessToken = OauthStorage.accessToken;

            /*Token available, check for refreshing*/
            if (OauthUtils.assertAvailable(accessToken)) {

                //Verify current token
                this.oauthVerifyToken(accessToken,
                    /**Ajax Response callback
                     * @param verify OauthVerificationResponse
                     * @param xhr XMLHttpRequest | ActiveXObject
                     * */
                    (verify, xhr) => {
                        if (OauthUtils.assertAvailable(verify)) {
                            if (OauthUtils.assertAvailable(verify.success)) {
                                if (verify.success == true) {
                                    if (typeof params.callback === 'function') {
                                        params.callback(OauthUtils.assertAvailable(accessToken)?accessToken:true);
                                    }
                                }
                                else {
                                    //Failed to verify token - get new token
                                    getNewOauthToken();
                                }
                            }
                            else if (OauthUtils.assertAvailable(verify.error)){
                                //Failed to verify token - get new token
                                getNewOauthToken();
                            }
                            else {
                                if (typeof params.callback === 'function') {
                                    params.callback(false);
                                }
                            }
                        }
                        else {

                            let expiry = parseInt(OauthStorage.getData(OauthStorage.expiresInKey));
                            let today = new Date();
                            let now = today.getTime();

                            /* Check if token has expired
                             * Check if current time is greater than 10 secs
                             * before the time the oauth token is supposed to expire
                             * (10 Secs before -> to prevent miscalculations due to
                             * delayed oauth server response)*/
                            if (now > expiry + 10) {
                                //expired - get refresh token
                                let refreshToken = OauthStorage.refreshToken;
                                if (OauthUtils.assertAvailable(refreshToken)) {
                                    //Try Refresh token
                                    refreshOauthToken(refreshToken);
                                }
                                else {
                                    //No refresh token get new token
                                    getNewOauthToken();
                                }
                            }
                            else {
                                if (typeof params.callback === 'function') {
                                    params.callback(false);
                                }
                            }
                        }
                    });
            }
            else {
                //No token - get new token
                getNewOauthToken();
            }
        }
    }

    /**Oauth Authorization
     * @param scope
     * @param redirect_url
     * @param user_id
     * @param state
     * */
    oauthAuthorize(scope: string[], redirect_url: string, user_id: string, state: string) {
        if (!OauthUtils.assertAvailable(redirect_url)) {
            throw "'redirect_url' Required"
        }

        OauthStorage.setData("oauth_state", state);
        let params = {
            client_id: this.clientId,
            scope: scope.join(" "),
            state: state,
            response_type: "code",
            user_id: user_id,
            redirect_uri: redirect_url
        };

        let url = `${this.authorizeUrl}?${OauthUtils.urlEncodeObject(params)}`;

        //Open authorization url
        window.open(url, '_blank');
    }



    /**Oauth Authorization
     * @param scope
     * @param redirect_url
     * @param email
     * @param state
     * */
    oauthAuthorizeWithEmail(scope: string[], redirect_url: string, email: string, state: string) {
        if (!OauthUtils.assertAvailable(redirect_url)) {
            throw "'redirect_url' Required"
        }

        OauthStorage.setData("oauth_state", state);
        let params = {
            client_id: this.clientId,
            scope: scope.join(" "),
            state: state,
            response_type: "code",
            email: email,
            redirect_uri: redirect_url
        };

        let url = `${this.authorizeUrl}?${OauthUtils.urlEncodeObject(params)}`;

        //Open authorization url
        window.open(url, '_blank');
    }


    /**Oauth Authorization
     * @param scope
     * @param redirect_url
     * @param user_id
     * @param state
     * */
    oauthAuthorizeImplicit(scope: string[], redirect_url: string, user_id: string, state: string) {
        if (!OauthUtils.assertAvailable(redirect_url)) {
            throw "'redirect_url' Required"
        }
        if (!OauthUtils.assertAvailable(scope)) {
            throw "'scope' Required"
        }

        OauthStorage.setData("oauth_state", state);
        let params = {
            client_id: this.clientId,
            scope: scope.join(" "),
            state: state,
            response_type: "token",
            user_id: user_id,
            redirect_uri: redirect_url
        };
        let url = `${this.authorizeUrl}?${OauthUtils.urlEncodeObject(params)}`;

        //Open authorization url
        window.open(url, '_blank');

    }

    /**Get oauth token with Client credentials
     * @param callback function
     * */
    oauthTokenWithClientCredentials(callback: (verify: OauthTokenResponse, xhr: XMLHttpRequest) => any) {
        OauthRequest.post({
            url: this.tokenUrl,
            params: {
                grant_type: OauthGrantType.Client_Credentials,
                client_id: this.clientId,
                client_secret: this.clientSecret
            },
            /**Ajax Response callback
             * @param xhr XMLHttpRequest | ActiveXObject
             * */
            success: (xhr) => {
                let token = OauthResponse.parseTokenResponse(xhr.responseText);
                if (typeof callback === 'function') {
                    callback(token, xhr);
                }
            },
            /**Ajax Response callback
             * @param xhr XMLHttpRequest | ActiveXObject
             * */
            fail: (xhr) => {
                let token = OauthResponse.parseTokenResponse(xhr.responseText);
                if (typeof callback === 'function') {
                    callback(token, xhr);
                }
            }
        })
    }


    /**Get oauth token with Client credentials
     * @param username
     * @param password
     * @param scope
     * @param callback function
     * */
    oauthTokenWithUserCredentials(username: string, password: string, scope:string[], callback: (verify: OauthTokenResponse, xhr: XMLHttpRequest) => any) {
        OauthRequest.post({
            url: this.tokenUrl,
            params: {
                grant_type: OauthGrantType.User_Credentials,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                username: username,
                password: password,
                scope: scope.join(" "),
            },
            /**Ajax Response callback
             * @param xhr XMLHttpRequest | ActiveXObject
             * */
            success: (xhr) => {
                let token = OauthResponse.parseTokenResponse(xhr.responseText);
                if (typeof callback === 'function') {
                    callback(token, xhr);
                }
            },
            /**Ajax Response callback
             * @param xhr XMLHttpRequest | ActiveXObject
             * */
            fail: (xhr) => {
                let token = OauthResponse.parseTokenResponse(xhr.responseText);
                if (typeof callback === 'function') {
                    callback(token, xhr);
                }
            }
        })
    }

    /**Get oauth token with Client credentials
     * @param code String
     * @param redirect_uri String
     * @param callback function
     * */
    oauthTokenWithAuthorizationCode(code: string, redirect_uri: string, callback: (verify: OauthTokenResponse, xhr: XMLHttpRequest) => any) {
        OauthRequest.post({
            url: this.tokenUrl,
            params: {
                grant_type: OauthGrantType.Authorization_Code,
                code: code,
                redirect_uri: redirect_uri,
                client_id: this.clientId,
                client_secret: this.clientSecret
            },
            /**Ajax Response callback
             * @param xhr XMLHttpRequest | ActiveXObject
             * */
            success: (xhr) => {
                let token = OauthResponse.parseTokenResponse(xhr.responseText);
                if (typeof callback === 'function') {
                    callback(token, xhr);
                }
            },
            /**Ajax Response callback
             * @param xhr XMLHttpRequest | ActiveXObject
             * */
            fail: (xhr) => {
                let token = OauthResponse.parseTokenResponse(xhr.responseText);
                if (typeof callback === 'function') {
                    callback(token, xhr);
                }
            }
        })
    }


    /**Get oauth Refresh Token with
     * Client credentials
     * @param refreshToken string
     * @param callback function
     * */
    oauthRefreshToken(refreshToken: string, callback: (verify: OauthTokenResponse, xhr: XMLHttpRequest) => any) {
        OauthRequest.post({
            url: this.tokenUrl,
            params: {
                grant_type: OauthGrantType.Refresh_Token,
                refresh_token: refreshToken,
                client_id: this.clientId,
                client_secret: this.clientSecret
            },
            /**Ajax Response callback
             * @param xhr XMLHttpRequest | ActiveXObject
             * */
            success: (xhr) => {
                let token = OauthResponse.parseTokenResponse(xhr.responseText);
                if (typeof callback === 'function') {
                    callback(token, xhr);
                }
            },
            /**Ajax Response callback
             * @param xhr XMLHttpRequest | ActiveXObject
             * */
            fail: (xhr) => {
                let token = OauthResponse.parseTokenResponse(xhr.responseText);
                if (typeof callback === 'function') {
                    callback(token, xhr);
                }
            }
        })
    }


    /**Get oauth Refresh Token with
     * Client credentials
     * @param accessToken string
     * @param callback function
     * */
    oauthVerifyToken(accessToken: string, callback: (verify: OauthVerificationResponse, xhr: XMLHttpRequest) => any) {
        OauthRequest.post({
            url: this.verifyTokenUrl,
            params: {
                access_token: accessToken,
            },
            /**Ajax Response callback
             * @param xhr XMLHttpRequest | ActiveXObject
             * */
            success: (xhr) => {
                let verify = OauthResponse.parseVerificationResponse(xhr.responseText);
                if (typeof callback === 'function') {
                    callback(verify, xhr);
                }
            },
            /**Ajax Response callback
             * @param xhr XMLHttpRequest | ActiveXObject
             * */
            fail: (xhr) => {
                let verify = OauthResponse.parseVerificationResponse(xhr.responseText);
                if (typeof callback === 'function') {
                    callback(verify, xhr);
                }
            }
        })
    }


}

/**Grant Types*/
export enum OauthGrantType
{
    Client_Credentials = "client_credentials",
    Authorization_Code = "authorization_code",
    User_Credentials = "password",
    Refresh_Token = "refresh_token",
    Auto = "auto",
}

/**Http Request Method*/
export enum OauthRequestMethod {
    GET = "get",
    POST = "post",
    PUT = "put",
    DELETE = "delete"
}

/**Http Request Params*/
export interface OauthRequestParams {
    url?: string;
    headers?: {
        [header: string]: string | string[];
    };
    query?: {
        [query: string]: string | string[];
    };
    params?: {
        [param: string]: string | string[];
    };
    username?: string;
    password?: string;
    withCredentials?: boolean;
    withAccessToken?: boolean;
    success?: (xhr?: XMLHttpRequest, result?: string) => any;
    fail?: (xhr?: XMLHttpRequest) => any;
}

/**Make Oauth Http requests*/
export class OauthRequest {
    private readonly xhttp: XMLHttpRequest;
    private username: string;
    private password: string;
    private withCredentials: boolean;
    private withAccessToken: boolean;
    private method: OauthRequestMethod;
    private url: string;
    private headers: object;
    private query: any;
    private params: any;
    private success: (xhr: XMLHttpRequest, result: string) => any;
    private fail: (xhr: XMLHttpRequest) => any;

    /**Make GET Requests
     * @param data Object
     * @param data.username string - Auth username (optional)
     * @param data.password string - Auth password (optional)
     * @param data.withCredentials boolean - Use Credentials (username & password) default = false
     * @param data.withAccessToken boolean - Use Access Token Header default = false
     * @param data.url string - Request Url
     * @param data.headers Object
     * @param data.query Object
     * @param data.params Object
     * @param data.success(xhr,result)
     * @param data.fail(xhr)
     * */
    static get(data:OauthRequestParams) {

        let http = new OauthRequest();
        http.username = data.username;
        http.password = data.password;
        http.withCredentials = data.withCredentials;
        http.withAccessToken = data.withAccessToken;
        http.method = OauthRequestMethod.GET;
        http.url = data.url;
        http.headers = data.headers;
        http.query = data.query;
        http.params = data.params;
        http.success = data.success;
        http.fail = data.fail;
        http.request()
    }

    /**Make POST Requests
     * @param data object
     * @param data.username string - Auth username (optional)
     * @param data.password string - Auth password (optional)
     * @param data.withCredentials boolean - Use Credentials (username & password) default = false
     * @param data.withAccessToken boolean - Use Access Token Header default = false
     * @param data.url string - Request Url
     * @param data.headers Object
     * @param data.query Object
     * @param data.params Object
     * @param data.success(xhr,result)
     * @param data.fail(xhr)
     * */
    static post(data:OauthRequestParams) {
        let http = new OauthRequest();
        http.username = data.username;
        http.password = data.password;
        http.withCredentials = data.withCredentials;
        http.withAccessToken = data.withAccessToken;
        http.method = OauthRequestMethod.POST;
        http.url = data.url;
        http.headers = data.headers;
        http.query = data.query;
        http.params = data.params;
        http.success = data.success;
        http.fail = data.fail;
        http.request()
    }

    /**Make PUT Requests
     * @param data object
     * @param data.username string - Auth username (optional)
     * @param data.password string - Auth password (optional)
     * @param data.withCredentials boolean - Use Credentials (username & password) default = false
     * @param data.withAccessToken boolean - Use Access Token Header default = false
     * @param data.url string - Request Url
     * @param data.headers Object
     * @param data.query Object
     * @param data.params Object
     * @param data.success(xhr,result)
     * @param data.fail(xhr)
     * */
    static put(data:OauthRequestParams) {
        let http = new OauthRequest();
        http.username = data.username;
        http.password = data.password;
        http.withCredentials = data.withCredentials;
        http.withAccessToken = data.withAccessToken;
        http.method = OauthRequestMethod.PUT;
        http.url = data.url;
        http.headers = data.headers;
        http.query = data.query;
        http.params = data.params;
        http.success = data.success;
        http.fail = data.fail;
        http.request()
    }

    /**Make DELETE Requests
     * @param data object
     * @param data.username string - Auth username (optional)
     * @param data.password string - Auth password (optional)
     * @param data.withCredentials boolean - Use Credentials (username & password) default = false
     * @param data.withAccessToken boolean - Use Access Token Header default = false
     * @param data.url string - Request Url
     * @param data.headers Object
     * @param data.query Object
     * @param data.params Object
     * @param data.success(xhr,result)
     * @param data.fail(xhr)
     * */
    static delete(data:OauthRequestParams) {
        let http = new OauthRequest();
        http.username = data.username;
        http.password = data.password;
        http.withCredentials = data.withCredentials;
        http.withAccessToken = data.withAccessToken;
        http.method = OauthRequestMethod.DELETE;
        http.url = data.url;
        http.headers = data.headers;
        http.query = data.query;
        http.params = data.params;
        http.success = data.success;
        http.fail = data.fail;
        http.request()
    }


    constructor() {
        this.xhttp = new XMLHttpRequest();
    }

    /**Make Http requests*/
    request() {

        if (this.username == null || typeof this.username === 'undefined') {
            this.username = "";
        }
        if (this.password == null || typeof this.password === 'undefined') {
            this.password = "";
        }
        if (this.withCredentials == null || typeof this.withCredentials === 'undefined') {
            this.withCredentials = false;
        }
        if (this.withAccessToken == null || typeof this.withAccessToken === 'undefined') {
            this.withAccessToken = false;
        }


        //If Queries available
        if (OauthUtils.assertAvailable(this.query)){
            if (this.url.match(/('?')/)==null){
                this.url += `?${OauthUtils.urlEncodeObject(this.query)}`
            }
            else{
                this.url += `&${OauthUtils.urlEncodeObject(this.query)}`
            }
        }

        //If GET Request
        if (this.method === OauthRequestMethod.GET) {
            if (OauthUtils.assertAvailable(this.params)) {
                if (this.url.match(/('?')/)==null){
                    this.url += `?${OauthUtils.urlEncodeObject(this.params)}`
                }
                else{
                    this.url += `&${OauthUtils.urlEncodeObject(this.params)}`
                }
            }
        }

        this.xhttp.withCredentials = this.withCredentials;
        this.xhttp.open(this.method.toString().toLowerCase(), this.url);

        // Get response
        this.xhttp.onreadystatechange = () => {
            if (this.xhttp.readyState === this.xhttp.DONE) {
                if (this.xhttp.status === 200) {
                    if (typeof this.success === 'function') {
                        this.success(this.xhttp, this.xhttp.responseText);
                    }
                }
                else {
                    if (typeof this.fail === 'function') {
                        this.fail(this.xhttp);
                    }
                }
            }
        };

        //Add headers
        if (this.headers !== null && typeof this.headers === 'object') {
            for (let key in this.headers) {
                if (this.headers.hasOwnProperty(key)) {
                    if (this.headers[key] !== null && typeof this.headers[key] !== 'undefined') {
                        this.xhttp.setRequestHeader(key, this.headers[key]);
                    }
                }
            }
        }

        //Add Basic Credentials if requested
        if (this.withCredentials) {
            this.xhttp.setRequestHeader("Authorization", 'Basic ' + btoa(this.username + ":" + this.password));
        }

        //Add Access Token if requested
        if (this.withAccessToken) {
            this.xhttp.setRequestHeader("Access-Token", OauthStorage.accessToken);
        }

        //Send Request
        if (this.method === OauthRequestMethod.GET) {
            this.xhttp.send();
        }
        else {

            if (this.params instanceof FormData){
                this.xhttp.send(this.params);
            }
            else{
                this.xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                let data = OauthUtils.urlEncodeObject(this.params);
                this.xhttp.send(data);
            }
        }
    }

}

/**Oauth Response*/
export class OauthResponse {

    /**@return OauthVerificationResponse
     * @param result string json result
     * @throws errorDescription
     * */
    static parseVerificationResponse(result): OauthVerificationResponse | null {
        let data = OauthUtils.parseJson(result);
        let verify = new OauthVerificationResponse(data);
        if (OauthUtils.assertAvailable(verify.success)) {
            return verify
        }
        else if (OauthUtils.assertAvailable(verify.error)) {
            return verify
        }
        return null;
    }


    /**@return OauthAuthorizationResponse
     * @param result string json result
     * */
    static parseAuthorizationResponse(result: string) {
        let data = OauthUtils.parseJson(result);
        let code = new OauthAuthorizationResponse(data);
        if (OauthUtils.assertAvailable(code.code)) {
            return code
        }
        else if (OauthUtils.assertAvailable(code.error)) {
            return code
        }
        return null;
    }


    /**@return OauthTokenResponse
     * @param result string json result
     * */
    static parseTokenResponse(result: string): OauthTokenResponse {
        let data = OauthUtils.parseJson(result);
        let token = new OauthTokenResponse(data);
        if (OauthUtils.assertAvailable(token.accessToken)) {
            return token
        }
        else if (OauthUtils.assertAvailable(token.error)) {
            return token
        }
        return null;
    }

}


/**Authorization Response*/
export class OauthVerificationResponse {
    public success: boolean;
    public error: string;
    public errorDescription: string;

    constructor(data) {
        this.success = data['success'];
        this.error = data['error'];
        this.errorDescription = data['error_description'];
    }
}

/**Authorization Response*/
export class OauthAuthorizationResponse {
    public state: string;
    public code: string;
    public error: string;
    public errorDescription: string;

    constructor(data) {
        this.state = data['state'];
        this.code = data['code'];

        this.error = data['error'];
        this.errorDescription = data['error_description'];
    }
}

/**Authorization Response*/
export class OauthTokenResponse {
    public accessToken: string;
    public refreshToken: string;
    public tokenType: string;
    public accessScope: string;
    public expiresIn: number;
    public error: string;
    public errorDescription: string;

    constructor(data) {
        this.accessToken = data['access_token'];
        this.refreshToken = data['refresh_token'];
        this.tokenType = data['token_type'];
        this.accessScope = data['scope'];
        this.expiresIn = data['expires_in'];

        this.error = data['error'];
        this.errorDescription = data['error_description'];
    }
}


/**Store and Retrieve Oauth variables*/
export class OauthStorage {
    static get accessTokenKey() {
        return "access_token"
    };

    static get refreshTokenKey() {
        return "refresh_token"
    };

    static get accessScopeKey() {
        return "scope"
    };

    static get tokenTypeKey() {
        return "token_type"
    };

    static get expiresInKey() {
        return "expires_in"
    };

    /**Save Access data to Local storage
     * @param accessData OauthTokenResponse */
    static saveAccess(accessData) {
        OauthStorage.setData(OauthStorage.accessTokenKey, OauthUtils.safeString(accessData.accessToken));
        OauthStorage.setData(OauthStorage.refreshTokenKey, OauthUtils.safeString(accessData.refreshToken));
        OauthStorage.setData(OauthStorage.accessScopeKey, OauthUtils.safeString(accessData.accessScope));
        OauthStorage.setData(OauthStorage.tokenTypeKey, OauthUtils.safeString(accessData.tokenType));

        let expires = new Date();
        expires.setSeconds(expires.getSeconds() + accessData.expiresIn);
        OauthStorage.setData(OauthStorage.expiresInKey, OauthUtils.safeString(expires.getTime()));
    }


    /**Clear all access data from session*/
    static clearAccess() {
        OauthStorage.removeData(OauthStorage.accessTokenKey);
        OauthStorage.removeData(OauthStorage.refreshTokenKey);
        OauthStorage.removeData(OauthStorage.accessScopeKey);
        OauthStorage.removeData(OauthStorage.tokenTypeKey);
        OauthStorage.removeData(OauthStorage.expiresInKey);
    }

    /** Set data - localstorage
     * @param name  name
     * @param value  value*/
    static setData(name, value) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(name, value);
        }
    }

    /** Set data - localStorage
     * @param name  name
     * */
    static getData(name) {
        if (typeof localStorage !== 'undefined') {
            return localStorage.getItem(name);
        }
    }

    /** Set data - localStorage
     * @param name  string
     * */
    static removeData(name) {
        if (typeof localStorage !== 'undefined') {
            return localStorage.removeItem(name);
        }
    }

    /**Clear all user data*/
    static clearAll() {
        if (typeof localStorage !== 'undefined') {
            return localStorage.clear();
        }
    }

    /**Get Access Token
     * @return String
     * */
    static get accessToken() {
        return OauthStorage.getData(OauthStorage.accessTokenKey);
    }

    /**Set Access Token
     * @param accessToken String
     * */
    static set accessToken(accessToken) {
        OauthStorage.setData(OauthStorage.accessTokenKey,accessToken);
    }

    /**Get Refresh Token
     * @return String
     * */
    static get refreshToken() {
        return OauthStorage.getData(OauthStorage.refreshTokenKey);
    }

    /**Get Access Scope
     * @return String
     * */
    static get accessScope() {
        return OauthStorage.getData(OauthStorage.accessScopeKey);
    }
}


/**Common Functions*/
export class OauthUtils {
    /**Check if collection contains data
     *  @param object object
     *  @param item string
     *  @return boolean*/
    static objectContains(object, item) {
        for (let key in object) {
            if (object.hasOwnProperty(key)) {
                if (object[key] !== null && typeof object[key] !== 'undefined') {
                    return key === item;
                }
            }
        }

        return false;
    }

    /**Get a safe form of string to store,
     * eliminating null and 'undefined'
     * @param item
     *  @return String*/
    static safeString(item) {
        if (OauthUtils.assertAvailable(item)) {
            return item;
        }
        return "";
    }


    /**Get a safe form of stIntring to store,
     * eliminating null and 'undefined'
     * @param item
     *  @return int*/
    static safeInt(item) {
        if (OauthUtils.assertAvailable(item)) {
            return item;
        }
        return 0;
    }


    /**Check if item is nut null, undefined or empty
     * eliminating null and 'undefined'
     * @param item
     *  @return boolean*/
    static assertAvailable(item) {
        return item != null && typeof item !== 'undefined' && item !== "";
    }

    /**Count Object array
     * @return int*/
    static count(obj: object): number {
        let element_count = 0;
        for (let i in obj) {
            if (obj.hasOwnProperty(i))
                element_count++;
        }
        return element_count;
    }

    /**Merge Object with another*/
    static mergeObj(obj: object, src: object) {
        for (let key in src) {
            if (src.hasOwnProperty(key)) {
                if (Array.isArray(obj)) //If array
                {
                    obj.push(src[key]);
                }
                else //object
                {
                    obj[this.count(obj)] = src[key];
                }
            }
        }
        return obj;
    }

    /**Encode Object content to url string
     *  @param myData Object
     *  @return String
     * */
    static urlEncodeObject(myData) {
        let encodeObj = (data, key, parent) => {
            let encoded = [];
            for (let subKey in data[key]) {
                if (data[key].hasOwnProperty(subKey)) {
                    if (data[key][subKey] !== null && typeof data[key][subKey] !== 'undefined') {
                        if (typeof data[key][subKey] === 'object' || Array.isArray(data[key][subKey])) { //If object or array
                            let newParent = parent + '[' + subKey + ']';
                            this.mergeObj(encoded, encodeObj(data[key], subKey, newParent));
                        }
                        else {
                            encoded.push(encodeURIComponent(parent + '[' + subKey + ']') + '=' + encodeURIComponent(data[key][subKey]));
                        }
                    }
                }
            }
            return encoded;
        };

        let encodeData = (data) => {
            let encoded = [];
            if (data !== null && typeof data === 'object') {
                for (let key in data) {
                    if (data.hasOwnProperty(key)) {
                        if (data[key] !== null && typeof data[key] !== 'undefined') {
                            if (typeof data[key] === 'object' || Array.isArray(data[key])) { //If object or array
                                this.mergeObj(encoded, encodeObj(data, key, key));
                            }
                            else {
                                encoded.push(key + '=' + encodeURIComponent(data[key]));
                            }
                        }
                    }
                }
            }
            return encoded;
        };

        let out = encodeData(myData);
        if (out.length > 0) {
            return out.join('&');
        }
        else {
            return "";
        }
    }


    /** Parse Json string to object
     *  @param json string
     *  @return String
     *  */
    static parseJson(json) {
        let result = "";
        try {
            result = JSON.parse(json);
        }
        catch (e) {
            console.log(e);
        }

        return result;
    }


    /**Get Url param
     * #source http://www.netlobo.com/url_query_string_javascript.html
     * */
    static getUrlParam(name, url?) {
        if (!url) url = location.href;
        url = decodeURIComponent(url);
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        let regexS = "[\\?&]" + name + "=([^&#]*)";
        let regex = new RegExp(regexS);
        let results = regex.exec(url);
        return results == null ? null : results[1];
    }


    /**Return url without it's url parameters
     * @param url Url to strip
     * @return string
     * */
    static stripUrlParams(url: string) {
        if (OauthUtils.assertAvailable(url)) {
            return url.split("?")[0];
        }
        else
            return url;
    }


    /**Generate Random value*/
    static generateKey(length) {

        if (!OauthUtils.assertAvailable(length))
            length = 16;

        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
}