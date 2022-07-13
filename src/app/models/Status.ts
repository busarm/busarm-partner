export enum StatusID {
  PROCESSING = "0",
  // Trip
  TRIP_UPCOMMING = "1",
  TRIP_ACTIVE = "2",
  TRIP_CLOSED = "3",
  TRIP_BOARDING = "4",
  TRIP_ON_THE_ROAD = "5",
  TRIP_ARRIVED = "6",
  TRIP_COMPLETED = "7",
  TRIP_ISSUES = "8",
  TRIP_CANCELLED = "9",
  // Booking
  BOOKING_NOT_PAID = "10",
  BOOKING_VERIFIED = "11",
  BOOKING_PENDING = "12",
  BOOKING_PAID = "13",
  BOOKING_SUCCESS = "14",
  // Transaction
  TRANSACTION_FAILED = "15",
  TRANSACTION_REFUNDED = "16",
  TRANSACTION_PAUSED = "17",
  TRANSACTION_STOPPED = "18",
  TRANSACTION_REFUNDING = "19",
}
export interface Status {
  status_id?: StatusID;
  status?: string;
  type_id?: string;
}
