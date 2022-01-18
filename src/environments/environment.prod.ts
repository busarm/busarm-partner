import {ENV} from "./ENV";
import * as envConfigs from "./env.json";

export const ENVIRONMENT: ENV = (envConfigs.testing || location.host.match(/staging\./)) ? ENV.TEST : ENV.PROD;
export const CONFIGS = {
    production: true,
    app_name: "Wecari Partner",
    app_version: "1.0.53", 
    oauth_scopes: ENVIRONMENT == ENV.TEST ? ['openid', 'user', 'agent', 'tester'] :  ['openid', 'user', 'agent'],
    ...envConfigs
};

