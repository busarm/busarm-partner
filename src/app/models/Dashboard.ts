import { Trip } from "./Trip/Trip";
import { BookingGroup } from "./Booking/BookingGroup";
import { BookingMonth } from "./Booking/BookingMonth";
import { PayOutTransaction } from "./Transaction/PayOutTransaction";
import { PayInTransaction } from "./Transaction/PayInTransaction";
import { AmountDetails } from "./AmountDetails";
import { Alert } from "./Alert";

export interface Dashboard {
  alert: Alert;
  active_trips: Trip[];
  booking_months?: BookingMonth[];
  bookings?: BookingGroup;
  transactions?: {
    on_hold?: TransactionGroup,
    released?: TransactionGroup,
  };
}

export interface TransactionGroup {
  bookings: {
    currency_code: string;
    amount: number;
    amount_details: AmountDetails[];
  };
  payin: PayInTransaction;
  payout: PayOutTransaction;
}
