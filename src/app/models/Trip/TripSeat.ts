
export interface TripSeat {
  trip_id: string;
  seat_id: string;
  status: string;
  booking_id?: string;
  temp_booking_id?: string;
  booking_status_id?: string;
  date_locked?: string;
  date_reserved?: string;
  date_created?: string;
}
