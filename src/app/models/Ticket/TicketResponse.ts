import { BaseResponse } from "../BaseResponse";
import { Ticket } from "./Ticket";


export interface TicketRepsonse extends BaseResponse {
  data?: Ticket;
}
