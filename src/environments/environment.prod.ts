import {ENV} from "./ENV";
export const environment = {
    production: true,
    app_name: "Wecari Partner",
    app_version: "1.0",
};
export const ENVIRONMENT: ENV = location.host.match(/staging/) ? ENV.TEST : ENV.PROD;

