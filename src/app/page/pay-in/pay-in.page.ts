import {Component, Input} from '@angular/core';
import {PayInTransaction} from "../../models/ApiResponse";
import {ModalController} from "@ionic/angular";
import {ToastType} from "../../utils/Utils";
import {Api} from "../../utils/Api";
import {PageController} from "../page-controller";

@Component({
    selector: 'app-pay-in',
    templateUrl: './pay-in.page.html',
    styleUrls: ['./pay-in.page.scss'],
})
export class PayInPage extends PageController {

    @Input() payIn: PayInTransaction;

    accountName: string;
    bankName: string;
    accountNumber: string;
    paymentReference: string;

    constructor(private modalCtrl: ModalController) {
        super();
    }

    public async ngOnInit() {
        await super.ngOnInit();
        this.accountName = this.session.configs.account_name;
        this.bankName = this.session.configs.bank_name;
        this.accountNumber = this.session.configs.account_number;
    }

    public async ionViewDidEnter() {
    }

    /**Submit request form*/
    public submit() {
        let payInRequest = {
            paymentReference: this.paymentReference,
            dateFrom: this.payIn.from,
            dateTo: this.payIn.to,
            currencyCode: this.payIn.currency_code,
            amount: this.payIn.balance,
        };
        this.showLoading().then(() => {
            Api.addPayInRequest(payInRequest, (status, result) => {
                this.hideLoading();
                if (status) {
                    this.showToastMsg(result.msg, ToastType.SUCCESS);
                    this.dismiss(true);
                }
                else {
                    this.showToastMsg(result, ToastType.ERROR);
                }
            });
        });
    }

    /**Get Status class for status*/
    public getStatusClass(status: string): string {
        if (this.assertAvailable(status)) {
            switch (status) {
                case "0":
                case "16":
                    return "status-warn";
                case "15":
                    return "status-cancel";
                case "14":
                    return "status-error";
                case "13":
                    return "status-ok";
                default:
                    return "status-cancel";
            }
        }
    }

    /**Close Modal*/
    dismiss(success?: boolean) {
        this.modalCtrl.dismiss(success)
    }

}
