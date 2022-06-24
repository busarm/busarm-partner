
export interface Location {
  is_active?: boolean | number | string;
  is_default?: boolean | number | string;
  loc_id?: number | string;
  loc_name?: string;
  loc_address?: string;
  lat?: number | string;
  lng?: number | string;
  type_id?: number | string;
  city_id?: number | string;
  city_name?: string;
  prov_code?: string;
  prov_name?: string;
  country_code?: string;
  country_name?: string;
}
