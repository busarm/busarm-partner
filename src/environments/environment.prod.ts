import {ENV} from "./ENV";
import * as envConfigs from "./env.prod.json";

export const ENVIRONMENT: ENV = location.host.match(/staging\./) ? ENV.TEST : ENV.PROD;
export const CONFIGS = envConfigs;

