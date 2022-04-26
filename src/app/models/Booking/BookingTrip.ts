import { Booking } from "./Booking";
import { BookingTicket } from "./BookingTicket";
import { TripSeat } from "../Trip/TripSeat";
import { Trip } from "../Trip//Trip";


export interface BookingTrip extends Booking {
  reference_code?: string;
  trip_id?: string;
  sub_total?: string;
  booking_fee?: string;
  is_reserved?: string;
  booking_date?: string;
  booking_time?: string;
  user_email?: string;
  user_name?: string;
  user_phone?: string;
  trip?: Trip;
  tickets?: BookingTicket[];
  qrcode_url?: string;
  seats?: TripSeat[];
}
