import { Platform } from "@ionic/angular";
import { AES256 } from "@ionic-native/aes-256/ngx";
import { AppComponent } from "../app.component";
import * as CryptoJS from "crypto-js";

export class CIPHER {
    private static aes256: AES256;
    private static platform: Platform;

    static init(app: AppComponent) {
        this.aes256 = app.aes256;
        this.platform = app.platform;
    }

    /**Encrypt Data
     * @param passphrase Encryption key
     * @param plain Data to encrypt
     * @param callback Action to perform after encryption
     * */
    static encrypt(
        passphrase: string,
        plain: string,
        callback: (status: boolean, result?: string) => any
    ) {
        if (passphrase) {
            let salt = CryptoJS.lib.WordArray.random(256);
            let key = CryptoJS.PBKDF2(passphrase, salt, {
                hasher: CryptoJS.algo.SHA512,
                keySize: 64 / 8,
                iterations: 100,
            });

            if (this.platform.is("cordova") && this.aes256) {
                this.aes256
                    .generateSecureIV(key.toString())
                    .then((iv) =>
                        this.aes256
                            .encrypt(key.toString(), iv, plain)
                            .then((cipher) => {
                                let ciphertext = CryptoJS.enc.Base64.stringify(cipher);
                                let hash = CIPHER.getDigest(
                                    ciphertext,
                                    CryptoJS.MD5(passphrase).toString()
                                );
                                let data = {
                                    ciphertext: ciphertext,
                                    iv: iv,
                                    salt: salt,
                                    hash: hash,
                                };
                                callback(
                                    true,
                                    CryptoJS.enc.Base64.stringify(
                                        CryptoJS.enc.Utf8.parse(JSON.stringify(data))
                                    )
                                );
                            })
                            .catch((error: any) => callback(false, error))
                    )
                    .catch((error: any) => callback(false, error));
            } else if (CryptoJS.AES) {
                let iv = CryptoJS.lib.WordArray.random(16);
                let cipher = CryptoJS.AES.encrypt(plain, key, {
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                });
                if (cipher && cipher.ciphertext) {
                    let ciphertext = CryptoJS.enc.Base64.stringify(cipher.ciphertext);
                    let hash = CIPHER.getDigest(
                        ciphertext,
                        CryptoJS.MD5(passphrase).toString()
                    );
                    let data = {
                        ciphertext: ciphertext,
                        iv: CryptoJS.enc.Hex.stringify(iv),
                        salt: CryptoJS.enc.Hex.stringify(salt),
                        hash: hash,
                    };
                    callback(
                        true,
                        CryptoJS.enc.Base64.stringify(
                            CryptoJS.enc.Utf8.parse(JSON.stringify(data))
                        )
                    );
                } else callback(false, "Failed to encrypt data");
            } else callback(false, "No encryption available");
        } else callback(false, "Failed to find encryption key");
    }

    /**Decrypt Data
     * @param key Encryption key
     * @param cipher Data to decrypt
     * @param callback Action to perform after encryption
     * */
    static decrypt(
        passphrase: string,
        cipher: string,
        callback: (status: boolean, data?: string) => any
    ) {
        if (passphrase) {
            try {
                let data = JSON.parse(
                    CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(cipher))
                );
                if (data) {
                    let ciphertext = data.ciphertext;
                    let salt = CryptoJS.enc.Hex.parse(data.salt);
                    let iv = CryptoJS.enc.Hex.parse(data.iv);
                    let hash = data.hash;

                    if (
                        hash ==
                        CIPHER.getDigest(ciphertext, CryptoJS.MD5(passphrase).toString())
                    ) {
                        let key = CryptoJS.PBKDF2(passphrase, salt, {
                            hasher: CryptoJS.algo.SHA512,
                            keySize: 64 / 8,
                            iterations: 100,
                        });

                        if (this.platform.is("cordova") && this.aes256) {
                            this.aes256
                                .decrypt(
                                    key.toString(),
                                    iv,
                                    CryptoJS.enc.Hex.stringify(
                                        CryptoJS.enc.Base64.parse(ciphertext)
                                    )
                                )
                                .then((plain) => callback(true, plain))
                                .catch((error: any) => callback(false, error));
                        } else if (CryptoJS.AES) {
                            let plain = CryptoJS.AES.decrypt(ciphertext, key, {
                                iv: iv,
                                mode: CryptoJS.mode.CBC,
                            });
                            if (plain) callback(true, CryptoJS.enc.Utf8.stringify(plain));
                            else callback(false, "Failed to decrypt data");
                        } else callback(false, "Failed to decrypt data");
                    } else callback(false, "Failed to verify data");
                } else callback(false, "Failed to retrieve data");
            } catch (e) {
                callback(false, e);
            }
        } else callback(false, "Failed to find encryption key");
    }

    /**
     * Generate hmac signature for data
     * @param data string String Data
     * @param key string hmac key
     * @return string|boolean
     */
    static getDigest(data: string, key: string) {
        return CryptoJS.HmacSHA256(data, key).toString();
    }
}
