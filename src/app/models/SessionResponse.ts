import { Session } from "./Session";
import { BaseResponse } from "./BaseResponse";


export interface SessionResponse extends BaseResponse {
  updated?: boolean;
  data?: Session;
}
