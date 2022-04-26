import { BaseResponse } from "../BaseResponse";
import { Location } from "./Location";

/*----LOCATION RESPONSE ------*/

export interface LocationListResponse extends BaseResponse {
  data?: Location[];
}
