import { Component, Input, OnInit } from "@angular/core";
import { PageController } from "../page-controller";
import { Bank } from "../../models/Bank";
import { PaymentMethod } from "../../models/Transaction/PaymentMethod";
import { PayOutTransaction } from "../../models/Transaction/PayOutTransaction";
import { Utils } from "../../helpers/Utils";
import { ToastType } from "../../services/app/AlertService";
import { Api } from "../../helpers/Api";

@Component({
  selector: "app-payout",
  templateUrl: "./payout.page.html",
  styleUrls: ["./payout.page.scss"],
})
export class PayoutPage extends PageController {
  payout: PayOutTransaction;
  banks: Bank[];
  selectedMethod: PaymentMethod;
  selectedMethodId: string;
  receiverName: string;
  receiverBank: string;
  receiverBankCode: string;
  receiverAccount: string;
  saveAccount: boolean = true;

  constructor() {
    super();
  }

  public async ngOnInit() {
    await super.ngOnInit();
    this.payout = await this.getRouteParams();
    if (this.user.bank_account) {
      this.receiverName = this.user.bank_account.account_name;
      this.receiverAccount = this.user.bank_account.account_number;
      this.receiverBank = this.user.bank_account.bank_name;
      this.receiverBankCode = this.user.bank_account.bank_code;
    }

    /*Give time for components to load first*/
    this.setTimeout(500).then(() => {
      if (!this.payout) {
        this.loadPayout();
      } else {
        if (
          this.payout.action_required &&
          this.payout.payment_methods &&
          this.payout.payment_methods.length == 1
        ) {
          this.selectedMethod = this.payout.payment_methods[0];
          this.selectedMethodId = this.selectedMethod.method_id;
          this.loadBanks(true);
        }
      }
    });
  }

  /**
   * Set selected bank
   */
  public setBank() {
    let bank = this.banks
      ? this.banks.find((bank) => bank.code == this.receiverBankCode)
      : null;
    this.receiverBank = bank ? bank.name : null;
  }

  /**
   * Set selected method
   */
  public setMethod() {
    this.selectedMethod = this.payout.payment_methods
      ? this.payout.payment_methods.find(
          (method) => method.method_id == this.selectedMethodId
        )
      : null;
    this.receiverBankCode = null;
    this.receiverBank = null;
    this.loadBanks();
  }

  /**
   * Load Banks
   */
  private async loadBanks(force = false) {
    if (!this.selectedMethod) {
      return;
    }
    this.showLoading().then(() => {
      Api.getBanks(
        this.session.country.country_code,
        this.selectedMethod.method_id,
        async ({ status, result, msg }) => {
          this.hideLoading();
          if (status) {
            this.banks = result.data;
          } else {
            await this.showToastMsg(msg, ToastType.ERROR);
            if (force) {
              this.instance.routeService.goHome();
            }
          }
        }
      );
    });
  }

  /**
   * Get transfer fee alert
   * @param amount
   */
  public getFeeAlert() {
    if (!this.selectedMethod) return "";
    return this.strings.format(
      this.strings.getString("payout_fee_alert_txt"),
      this.payout.currency_code + " " + this.selectedMethod.transfer_minimum
    );
  }

  /**
   * Get transfer fee
   * @param amount
   */
  public getFee() {
    if (!this.selectedMethod) return "";
    return (
      Utils.parseFloat(this.selectedMethod.transfer_fee) +
      (Utils.parseFloat(this.selectedMethod.transfer_fee_percent) / 100) *
        Utils.parseFloat(this.payout.balance)
    );
  }
  /**
   * Load Payout Transactions
   */
  private loadPayout() {
    this.showLoading().then(() => {
      Api.getPayOutTransactions(async ({ status, result, msg }) => {
        this.hideLoading();
        if (status) {
          this.payout = result.data;
          if (
            this.payout.payment_methods &&
            this.payout.payment_methods.length == 1
          ) {
            this.selectedMethod = this.payout.payment_methods[0];
            this.selectedMethodId = this.selectedMethod.method_id;
            this.loadBanks(true);
          }
        } else if (!this.payout) {
          await this.showToastMsg(msg, ToastType.ERROR);
          this.instance.routeService.goHome();
        }
      });
    });
  }

  /**Submit request form*/
  public submit() {
    let save =
      this.saveAccount &&
      (!this.user.bank_account ||
        (this.user.bank_account &&
          (this.receiverAccount != this.user.bank_account.account_name ||
            this.receiverAccount != this.user.bank_account.account_number ||
            this.receiverBank != this.user.bank_account.bank_name ||
            this.receiverBankCode != this.user.bank_account.bank_code)));

    let payoutRequest = {
      methodId: this.selectedMethodId,
      receiverName: this.receiverName,
      receiverBank: this.receiverBank,
      receiverBankCode: this.receiverBankCode,
      receiverAccount: this.receiverAccount,
      dateFrom: this.payout.from,
      dateTo: this.payout.to,
      currencyCode: this.payout.currency_code,
      amount: this.payout.balance,
      saveAccount: save ? 1 : 0,
    };
    this.showLoading().then(() => {
      Api.addPayoutRequest(payoutRequest, ({ status, result, msg }) => {
        this.hideLoading();
        if (status) {
          this.showToastMsg(result.msg, ToastType.SUCCESS);
          this.loadPayout();
        } else {
          this.showToastMsg(msg, ToastType.ERROR);
        }
      });
    });
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
