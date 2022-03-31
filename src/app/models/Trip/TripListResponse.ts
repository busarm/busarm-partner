import { BaseResponse } from "../BaseResponse";
import { Trip } from "./Trip";

/*----TRIP INFO RESPONSE ------*/

export interface TripListResponse extends BaseResponse {
  data?: Trip[];
}
