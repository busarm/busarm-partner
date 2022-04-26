import { BaseResponse } from "./BaseResponse";
import { Status } from "./Status";

/*----TRIP STATUS RESPONSE ------*/

export interface StatusListResponse extends BaseResponse {
  data?: Status[];
}
