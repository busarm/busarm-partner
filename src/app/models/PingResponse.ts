import { BaseResponse } from "./BaseResponse";


export interface PingResponse extends BaseResponse {
  env?: string;
  ip?: string;
}
