import { ENV } from "./ENV";
import envConfigs from "./env.json";

export const ENVIRONMENT: ENV =
  envConfigs.testing || location.host.match(/staging\./) ? ENV.TEST : ENV.PROD;
export const CONFIGS = {
  production: true,
  app_name: "Busarm Partner",
  app_version: "1.0.58",
  oauth_scopes:
    ENVIRONMENT == ENV.TEST
      ? ["openid", "user", "agent", "tester"]
      : ["openid", "user", "agent"],
  ...envConfigs,
};
