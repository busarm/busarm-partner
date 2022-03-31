import { BaseResponse } from "../BaseResponse";
import { User } from "./User";


export interface UserListResponse extends BaseResponse {
  data?: User[];
}
