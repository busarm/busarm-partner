export enum StatusID {
  PROCESSING = "0",
  TRIP_UPCOMMING = "1",
  TRIP_ACTIVE = "2"
}
export interface Status {
  status_id?: StatusID;
  status?: string;
  type_id?: string;
}
