import { BusImage } from "./BusImage";
import { BusSharedPartner } from "./BusSharedPartner";


export interface Bus {
  id?: string;
  plate_num?: string;
  description?: string;
  seats?: string;
  type?: string;
  shared?: string;
  shared_partners?: BusSharedPartner[];
  type_id?: string;
  images?: BusImage[];
  available?: string;
}
