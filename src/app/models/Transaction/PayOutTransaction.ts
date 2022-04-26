import { AmountDetails } from "../AmountDetails";
import { PayOutTransactionRequest } from "./PayOutTransactionRequest";
import { PaymentMethod } from "./PaymentMethod";


export interface PayOutTransaction {
  currency_code: string;
  amount: number;
  amount_details: AmountDetails[];
  paid: number;
  overpaid: number;
  balance: number;
  from: string;
  to: string;
  action_required: boolean;
  requests: PayOutTransactionRequest[];
  info: string;
  payment_methods: PaymentMethod[];
}
