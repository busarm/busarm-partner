import { BusImage } from "./BusImage";
import { BusSharedPartner } from "./BusSharedPartner";


export interface Bus {
  id?: string;
  plate_number?: string;
  description?: string;
  seats?: string;
  type?: string;
  shared?: string;
  shared_partners?: BusSharedPartner[];
  type_id?: string;
  images?: BusImage[];
  available?: string;
  has_ac?: string;
  has_charger?: string;
  has_wifi?: string;
  has_light?: string;
  has_blanket?: string;
  has_food?: string;
  has_water?: string;
  has_tv?: string;
  has_toilet?: string;
}
