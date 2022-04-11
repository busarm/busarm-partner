import { BaseResponse } from "../BaseResponse";
import { Trip } from "./Trip";


export interface TripResponse extends BaseResponse {
  data?: Trip;
}
