
export interface Ticket {
  ticket_id?: string;
  type_id?: string;
  name?: string;
  currency_code?: string;
  price?: string;
  description?: string;
  allow_deactivate?: string | number | boolean | any;
  is_active?: string | number | boolean | any;
}
