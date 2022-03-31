import { BaseResponse } from "../BaseResponse";
import { Bus } from "./Bus";


export interface BusResponse extends BaseResponse {
  data?: Bus;
}
