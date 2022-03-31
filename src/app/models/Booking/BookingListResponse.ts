import { BaseResponse } from "../BaseResponse";
import { BookingTrip } from "./BookingTrip";

/*----BOOKING INFO RESPONSE ------*/

export interface BookingListResponse extends BaseResponse {
  data?: BookingTrip[];
}
