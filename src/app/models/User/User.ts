import { Location } from "../Location/Location";
import { Country } from "../Country";
import { BankAccount } from "../BankAccount";


export interface User {
  id?: string;
  agent_id?: string;
  name?: string;
  email?: string;
  dial_code?: string;
  phone?: string;
  lang?: string;
  is_active?: boolean | number;
  is_admin?: boolean | number;
  is_agent?: boolean | number;
  is_partner?: boolean | number;
  partner_id?: string;
  partner_logo?: string;
  partner_name?: string;
  partner_active?: boolean | number;
  partner_verified?: boolean | number;
  account_id?: string;
  suspended?: string;
  verified?: string;
  country?: Country;
  permissions?: string[];
  allow_international?: boolean | number;
  allow_multi_countries?: boolean | number;
  bank_account?: BankAccount;
  default_location?: Location;
}
