/**
 * Use this file to define all the strings
 * you want to show to the user
 * so if any translation available,
 * user can be served the language
 * based on their selection and also
 * to avoid duplicates
 * */
import { Utils } from "./helpers/Utils";

/*----------DEFINE STRING KEYS---------------*/

import en from "../assets/langs/en.json"
export type StringKey = keyof typeof en;
type String = { [key in StringKey]: string };

/*----------DEFINE STRING KEYS---------------*/



/*----------DEFINE LANGUAGE STRINGS HERE---------------*/
const English = en;
/*----------DEFINE LANGUAGE STRINGS HERE---------------*/



/*----------DEFINE LANGUAGE KEYS---------------*/

export enum Langs {
  EN,
}
export type LangKey = keyof typeof Langs;
type Lang = { [key in LangKey]: String };

/*----------DEFINE LANGUAGE KEYS---------------*/


/*------------ADD LANGUAGES HERE------------*/
export const Languages: Lang = {
  EN: English
};
/*------------ADD LANGUAGES HERE------------*/



/*----------DEFINE ASSET KEYS---------------*/

enum AssetId {
  logo_white = "imgs/logo_white.png",
  logo_dark = "imgs/logo_dark.png",
  logo_light = "imgs/logo_light.png",
  logo_txt_white = "imgs/logo_txt_white.png",
  logo_txt_dark = "imgs/logo_txt_dark.png",
  logo_txt_light = "imgs/logo_txt_light.png",
  placeholder = "imgs/placeholder.png",
  powered_by_google = "imgs/powered_by_google.png"
}
export type AssetKey = keyof typeof AssetId;

/*----------DEFINE ASSET KEYS---------------*/


export class Strings {

  private static defaultLanguage: String = Languages.EN;
  private static currentLanguage: String = Strings.defaultLanguage;

  /**Set Default language
   * @param lang
   * */
  public static setLanguage(lang: LangKey | string) {
    Strings.currentLanguage = Languages[lang];
  }

  /**Get String to display to user
   * @param key StringKey
   * @param lang LangKey
   * @return string
   * */
  public static getString(key: StringKey, lang?: LangKey | string): string {
    if (Utils.assertAvailable(lang)) {
      if (Utils.assertAvailable(Languages[lang][key])) {
        return Languages[lang][key];
      }
      else {
        return Strings.defaultLanguage[key];
      }
    }
    else {
      if (Utils.assertAvailable(Strings.currentLanguage[key])) {
        return Strings.currentLanguage[key];
      }
      else {
        return Strings.defaultLanguage[key];
      }
    }
  }

  /**
   * Format String
   * Strings should contain placeholders e.g {0}, {1}, {2} etc.
   * @param str string
   * @param args
   */
  public static format(str: string, ...args) {
    return str.replace(/{(\d+)}/g, function (match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
        ;
    });
  };
}

export class Assets {
  public static getPath(name: AssetKey) {
    return "assets/" + AssetId[name];
  }
}
