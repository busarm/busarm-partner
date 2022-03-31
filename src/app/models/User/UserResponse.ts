import { BaseResponse } from "../BaseResponse";
import { User } from "./User";

/*----USER INFO RESPONSE ------*/

export interface UserResponse extends BaseResponse {
  data?: User;
}
