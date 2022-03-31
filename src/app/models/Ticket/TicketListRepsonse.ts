import { BaseResponse } from "../BaseResponse";
import { Ticket } from "./Ticket";

/*----TICKET INFO RESPONSE ------*/

export interface TicketListRepsonse extends BaseResponse {
  data?: Ticket[];
}
