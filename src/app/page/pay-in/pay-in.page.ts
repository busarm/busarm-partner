import {Component, Input} from '@angular/core';
import {PayInTransaction} from "../../models/ApiResponse";
import {ToastType} from "../../libs/Utils";
import {Api} from "../../libs/Api";
import {PageController} from "../page-controller";

@Component({
    selector: 'app-pay-in',
    templateUrl: './pay-in.page.html',
    styleUrls: ['./pay-in.page.scss'],
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
        this.accountName = this.session.configs.account_name;
        this.bankName = this.session.configs.bank_name;
        this.accountNumber = this.session.configs.account_number;
        this.payIn = await this.getRouteParams();
        if(!this.payIn){
            this.loadPayin();
        }
    }

    /**
     * Load Payin Transactions
     */
    private loadPayin(){
        this.showLoading().then(()=>{
            Api.getPayInTransactions(async (status, result) =>{
                this.hideLoading();
                if(status){
                    this.payIn = result.data;
                }
                else {
                    await this.showToastMsg(result, ToastType.ERROR);
                    this.instance.goHome();
                }
            })
        })
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
            Api.addPayInRequest(payInRequest, (status, result) => {
                this.hideLoading();
                if (status) {
                    this.showToastMsg(result.msg, ToastType.SUCCESS);
                    this.loadPayin();
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
