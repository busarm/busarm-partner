import { BaseResponse } from "../BaseResponse";
import { BusType } from "./BusType";

/*----BUS TYPE RESPONSE ------*/

export interface BusTypeListResponse extends BaseResponse {
  data?: BusType[];
}
