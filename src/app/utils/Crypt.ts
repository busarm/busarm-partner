import {AES256} from '@ionic-native/aes-256/ngx';
import {Strings} from "../resources";

export class Crypt {

    private static aes256: AES256;

    static init(aes256: AES256) {
        this.aes256 = aes256;
    }


    /**Encrypt Data
     * @param key Encryption  key length(32)
     * @param data Data to encrypt
     * @param callback Action to perform after encryption
     * */
    static encrypt(key: string, data: string, callback: (status: boolean, result?: string, iv?: string) => any) {
        if (this.aes256 && key) {
            this.aes256.generateSecureIV(key)
                .then(iv =>
                    this.aes256.encrypt(key, iv, data)
                        .then(cipher => callback(true, cipher, iv))
                        .catch((error: any) => callback(false, error)))
                .catch((error: any) => callback(false, error));
        }
        else callback(false, Strings.getString("error_unexpected"));
    }

    /**Decrypt Data
     * @param data Data to decrypt
     * @param key Encryption  key length(32)
     * @param iv iv
     * @param callback Action to perform after encryption
     * */
    static decrypt(key: string, iv: string, data: string, callback: (status: boolean, data?: string) => any) {
        if (this.aes256 && key) {
            this.aes256.decrypt(key, iv, data)
                .then(plain => callback(true, plain))
                .catch((error: any) => callback(false, error));
        }
        else callback(false, Strings.getString("error_unexpected"));
    }

}