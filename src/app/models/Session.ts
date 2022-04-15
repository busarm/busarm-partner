import { Country } from "./Country";
import { BankAccount } from "./BankAccount";
import { User } from "./User/User";
import { Config } from "./Config";
import { Language } from "./Language";


export interface Session {
  session_token: string;
  encryption_key: string;
  configs: Config;
  country?: Country;
  countries?: Country[];
  language?: Language;
  languages?: Language[];
  bank?: BankAccount;
  user?: User;
}
