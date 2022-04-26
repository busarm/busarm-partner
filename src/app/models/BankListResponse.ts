import { BaseResponse } from "./BaseResponse";
import { Bank } from "./Bank";

/*------BANKS RESPONSE*/

export interface BankListResponse extends BaseResponse {
  data?: Bank[];
}
