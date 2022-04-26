export interface AmountDetails {
  title: string;
  currency_code: string;
  info: string;
  amount: number;
  amount_details: this[];
}
