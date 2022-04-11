import { BaseResponse } from "../BaseResponse";
import { Bus } from "./Bus";

/*----BUS INFO RESPONSE ------*/

export interface BusListResponse extends BaseResponse {
  data?: Bus[];
}
