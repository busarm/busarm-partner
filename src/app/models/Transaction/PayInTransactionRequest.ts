
export interface PayInTransactionRequest {
  request_id: number;
  status_id: string;
  status_info: string;
  status: string;
  date_from: string;
  date_to: string;
  payment_reference: string;
  currency_code: string;
  amount: number;
  date_created: string;
  payment_url: string;
}
