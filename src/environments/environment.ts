import {ENV} from "./ENV";
import * as envConfigs from "./env.json";

export const ENVIRONMENT: ENV = ENV.DEV;
export const CONFIGS = {
    production: false,
    app_name: "Busarm Partner",
    app_version: "1.0.62",
    oauth_scopes: ['openid', 'user', 'agent', 'tester'],
    ...envConfigs
};


