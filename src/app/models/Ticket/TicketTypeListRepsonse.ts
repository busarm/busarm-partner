import { BaseResponse } from "../BaseResponse";
import { TicketType } from "./TicketType";

/*----TICKET TYPES RESPONSE ------*/

export interface TicketTypeListRepsonse extends BaseResponse {
  data?: TicketType[];
}
