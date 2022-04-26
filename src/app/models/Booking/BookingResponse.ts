import { BaseResponse } from "../BaseResponse";
import { BookingTrip } from "./BookingTrip";


export interface BookingResponse extends BaseResponse {
  data?: BookingTrip;
}
