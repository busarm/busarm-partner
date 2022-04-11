import { AmountDetails } from "../AmountDetails";
import { PayInTransactionRequest } from "./PayInTransactionRequest";


export interface PayInTransaction {
  currency_code: string;
  amount: number;
  amount_details: AmountDetails[];
  paid: number;
  overpaid: number;
  balance: number;
  from: string;
  to: string;
  last_day_to_action: string;
  action_required: boolean;
  requests: PayInTransactionRequest[];
  info: string;
  alert: string;
  payment_reference: string;
  payment_available: boolean;
}
