import { Component, Input } from "@angular/core";
import { PayInTransaction } from "../../models/Transaction/PayInTransaction";
import { ToastType } from "../../helpers/Utils";
import { Api } from "../../helpers/Api";
import { PageController } from "../page-controller";
import { Urls } from "../../helpers/Urls";

@Component({
  selector: "app-pay-in",
  templateUrl: "./pay-in.page.html",
  styleUrls: ["./pay-in.page.scss"],
})
export class PayInPage extends PageController {
  payIn: PayInTransaction;
  accountName: string;
  bankName: string;
  accountNumber: string;

  constructor() {
    super();
  }

  public async ngOnInit() {
    await super.ngOnInit();
    if (this.session.bank) {
      this.accountName = this.session.bank.account_name;
      this.bankName = this.session.bank.bank_name;
      this.accountNumber = this.session.bank.account_number;
    }
    this.payIn = await this.getRouteParams();

    /*Give time for components to load first*/
    this.setTimeout(500).then(() => {
      if (!this.payIn) {
        this.loadPayin();
      }
    });
  }

  /**
   * Load Payin Transactions
   */
  private loadPayin() {
    this.showLoading().then(() => {
      Api.getPayInTransactions(async ({ status, result, msg }) => {
        this.hideLoading();
        if (status) {
          this.payIn = result.data;
        } else if (!this.payIn) {
          await this.showToastMsg(msg, ToastType.ERROR);
          this.instance.routeService.goHome();
        }
      });
    });
  }

  /**Submit request form*/
  public submit() {
    let payInRequest = {
      paymentReference: this.payIn.payment_reference,
      dateFrom: this.payIn.from,
      dateTo: this.payIn.to,
      currencyCode: this.payIn.currency_code,
      amount: this.payIn.balance,
    };
    this.showLoading().then(() => {
      Api.addPayInRequest(payInRequest, ({ status, result, msg }) => {
        this.hideLoading();
        if (status) {
          this.loadPayin();
          if (result.data && result.data.paymentUrl) {
            this.gotoPayment(result.data.paymentUrl);
          } else {
            this.showToastMsg(result.msg, ToastType.SUCCESS);
          }
        } else {
          this.showToastMsg(msg, ToastType.ERROR);
        }
      });
    });
  }

  /**
   * Open payment url
   * @param paymentUrl
   */
  public gotoPayment(paymentUrl) {
    paymentUrl +=
      "&redirect_uri=" +
      Urls.baseUrl() +
      this.instance.router.url.replace("/", "");
    this.ngOnDestroy();
    window.open(paymentUrl, "_self");
  }

  /**Get Status class for status*/
  public getStatusClass(status: string): string {
    if (this.assertAvailable(status)) {
      switch (status) {
        case "0":
        case "17":
          return "status-warn";
        case "16":
          return "status-cancel";
        case "15":
          return "status-error";
        case "14":
          return "status-ok";
        case "18":
        default:
          return "status-cancel";
      }
    }
  }
}
