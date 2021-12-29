# Wecari API

## Description

App for Wecari Partners

## Requirementts

- NodeJs Version - Version >= 14.0
- Framework - Ionic (Angular) v5. Visit https://ionicframework.com/docs/

## Security

### Authentication

- Requires oauth jwt tokens issued by `Wecari Oauth` to access API resources

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
	- Go to `application\environments`
	- Copy `env.example.json` to `env.json`
	- Add environment variables in `env.json`
- Run `ionic serve --port=<PORT_NUMBER>` for a dev server.

## Setting Up (Production)

- Install dependencies
	- Install Ionic. Visit https://ionicframework.com/docs/intro/cli
	- Install NPM Packages. Run `npm install`
- Add environment variables.
	- Go to `application\environments` directory
	- Copy `env.example.json` to `env.prod.json`
	- Add environment variables in `env.prod.json`

### Build for Web

- Run `ionic build --prod --optimizejs --minifyjs --minifycss --aot` to build for production.
- Upload build files in `www` directory to production environment

### Build for Android

- Run `ionic cordova build android --prod --optimizejs --minifyjs --minifycss --aot --release` to build for production.
- See https://ionicframework.com/docs/deployment/play-store

### Build for IOS

- Run `ionic cordova build ios --prod --optimizejs --minifyjs --minifycss --aot --release` to build for production.
- See https://ionicframework.com/docs/deployment/app-store
