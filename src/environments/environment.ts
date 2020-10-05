import {ENV} from "./ENV";
export const environment = {
    production: false,
    app_name: "Wecari Partner",
    app_version: "1.0", 
    oauth_client_id: "wecari_partner_app_M4NgNbnsCy",
    oauth_client_secret: "2627b1c45ef96be17b7a3de1cd4d3bad5172b1381f2b2100e41edebc68ec42e9",
};
// export const ENVIRONMENT: ENV = location.host.match(/localhost/) ? ENV.DEV : ENV.TEST;
export const ENVIRONMENT: ENV = ENV.TEST;


