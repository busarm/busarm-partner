import { Country } from "./Country";
import { BankAccount } from "./BankAccount";
import { User } from "./User/User";
import { Config } from "./Config";


export interface Session {
  session_token?: string;
  encryption_key?: string;
  configs: Config;
  country?: Country;
  countries?: Country[];
  bank: BankAccount;
  user: User;
}
