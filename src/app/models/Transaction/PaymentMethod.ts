export interface PaymentMethod {
  method_id: string;
  method_name?: string;
  method_value?: string;
  country_code?: string;
  provider?: string;
  fees: number;
  fees_percent: number;
  transfer_fee: number;
  transfer_fee_percent?: number;
  transfer_minimum?: number;
  transfer_type?: string;
  use_payment?: number;
  is_default?: number;
  is_active?: number;
  use_transfer?: number;
}
