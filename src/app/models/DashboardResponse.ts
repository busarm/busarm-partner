import { BaseResponse } from "./BaseResponse";
import { Dashboard } from "./Dashboard";

/*------DASHBOARD RESPONSE*/

export interface DashboardResponse extends BaseResponse {
  data?: Dashboard;
}
