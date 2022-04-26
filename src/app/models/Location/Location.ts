
export interface Location {
  is_active?: boolean | number | string;
  is_default?: boolean | number | string;
  loc_id?: number;
  loc_name?: string;
  loc_address?: string;
  lat?: number;
  lng?: number;
  type_id?: number;
  city_id?: number;
  city_name?: string;
  prov_code?: string;
  prov_name?: string;
  country_code?: string;
  country_name?: string;
}
