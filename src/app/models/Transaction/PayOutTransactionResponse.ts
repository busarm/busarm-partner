import { BaseResponse } from "../BaseResponse";
import { PayOutTransaction } from "./PayOutTransaction";

/*------PAYOUT TRANSACTION RESPONSE*/

export interface PayOutTransactionResponse extends BaseResponse {
  data?: PayOutTransaction;
}
