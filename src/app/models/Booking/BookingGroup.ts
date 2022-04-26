export interface BookingGroup {
  verified: number;
  pending: number;
  unpaid: number;
  paid: number;
  canceled?: number;
}
