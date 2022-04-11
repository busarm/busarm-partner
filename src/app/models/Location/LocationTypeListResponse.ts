import { BaseResponse } from "../BaseResponse";
import { LocationType } from "./LocationType";

/*----LOCATION TYPE RESPONSE ------*/

export interface LocationTypeListResponse extends BaseResponse {
  data?: LocationType[];
}
