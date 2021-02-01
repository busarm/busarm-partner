import {ENV} from "./ENV";
export const ENVIRONMENT: ENV = location.host.match(/staging\./) ? ENV.TEST : ENV.PROD;
export const CONFIGS = {
    production: true,
    app_name: "Wecari Partner",
    app_version: "1.0.38",
    oauth_client_id: "wecari_partner_app_M4NgNbnsCy",
    oauth_client_secret: "2627b1c45ef96be17b7a3de1cd4d3bad5172b1381f2b2100e41edebc68ec42e9",
    oauth_scopes: ENVIRONMENT == ENV.TEST ? ['openid', 'user', 'agent', 'tester'] :  ['openid', 'user', 'agent'],
    bugsnag_key: "9489c6c7a352848ed88a385cd7f37f25",
};

