import { BaseResponse } from "../BaseResponse";
import { PayInTransaction } from "./PayInTransaction";

/*------PAYIN TRANSACTION RESPONSE*/

export interface PayInTransactionResponse extends BaseResponse {
  data?: PayInTransaction;
}
