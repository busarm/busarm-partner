
export interface PayOutTransactionRequest {
  request_id: number;
  status_id: string;
  status: string;
  status_info: string;
  date_from: string;
  date_to: string;
  receiver_name: string;
  receiver_bank: string;
  receiver_bank_code: string;
  receiver_account_no: string;
  currency_code: string;
  amount: number;
  transfer_fee: number;
  date_created: string;
}
