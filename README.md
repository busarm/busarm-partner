# Busarm Partner

## Description

App for Busarm Partners

## Requirementts

- NodeJs Version - Version >= 14.0
- Angular Version - Version >= 12.0
- Framework - Ionic (Angular) v6. Visit https://ionicframework.com/docs/

## Security

### Authentication

- Requires oauth jwt tokens issued by `Busarm Oauth` to access API resources

### Authorization

- Scope based authorization. Uses oauth jwt token scopes to grant access.

### Session & Encryption

- Session tokens and Encryption keys are used to secure connection to the API
- Session tokens are also used for CSRF prevention
- AES-256-CBC Optional Encryption for API request & response

## Setting Up (Development)

- Install dependencies
  - Install Ionic. Visit https://ionicframework.com/docs/intro/cli
  - Install NPM Packages. Run `npm install`
- Add environment variables.
  - Go to `src\app\environments`
  - Copy `env.example.json` to `env.json`
  - Add environment variables in `env.json`
- Run `ionic serve --port=<PORT_NUMBER>` for a dev server.

## Setting Up (Staging/Production)

- Install dependencies
  - Install Ionic. Visit https://ionicframework.com/docs/intro/cli
  - Install NPM Packages. Run `npm install`
- Add environment variables.
  - Go to `src\app\environments` directory
  - Copy `env.example.json` to `env.json`
  - Add environment variables in `env.json`

## Update version

- Version is defined in multiple places, all of which would need to be updated:
  - `src\app\environments\environment.ts` - App version (dev)
  - `src\app\environments\environment.prod.ts` - App version (prod)
  - `src\manifest.json` - PWA App version
  - `config.txt` - Cordova Native App Version
  - `config.xml` - Cordova Native App Version
  - `package.json` - NPM Package version

### Build for Web

- Run `ionic build --prod --optimizejs --minifyjs --minifycss --aot` to build for production.
- Upload build files in `www` directory to production environment

### Build for Android

- Run `ionic cordova build android --prod --optimizejs --minifyjs --minifycss --aot --release` to build for production.
- See https://ionicframework.com/docs/deployment/play-store

### Build for IOS

- Run `ionic cordova build ios --prod --optimizejs --minifyjs --minifycss --aot --release` to build for production.
- See https://ionicframework.com/docs/deployment/app-store
