import {Component, Input, OnInit} from '@angular/core';
import {PageController} from "../page-controller";
import {PayOutTransaction} from "../../models/ApiResponse";
import {ToastType} from "../../libs/Utils";
import {Api} from "../../libs/Api";

@Component({
    selector: 'app-payout',
    templateUrl: './payout.page.html',
    styleUrls: ['./payout.page.scss'],
})

export class PayoutPage extends PageController {

    payout: PayOutTransaction;
    receiverName: string;
    receiverBank: string;
    receiverAccount: string;
    saveAccount: boolean = false;

    constructor() {
        super();
    }

    public async ngOnInit() {
        await super.ngOnInit();
        this.payout = await this.getRouteParams();
        if(!this.payout){
            this.loadPayout();
        }
    }

    public ionViewDidEnter(){
        if(this.userInfo.bank_account){
            this.receiverName = this.userInfo.bank_account.account_name;
            this.receiverAccount = this.userInfo.bank_account.account_number;
            this.receiverBank = this.userInfo.bank_account.bank_name;
        }
    }

    /**
     * Load Payout Transactions
     */
    private loadPayout(){
        this.showLoading().then(()=>{
            Api.getPayOutTransactions(async (status, result) =>{
                this.hideLoading();
                if(status){
                    this.payout = result.data;
                }
                else {
                    await this.showToastMsg(result, ToastType.ERROR);
                    this.instance.goHome();
                }
            })
        })
    }

    /**Submit request form*/
    public submit(){
        let save = this.saveAccount && (!this.userInfo.bank_account || (this.userInfo.bank_account && (this.receiverAccount != this.userInfo.bank_account.account_name ||
            this.receiverAccount != this.userInfo.bank_account.account_number ||
            this.receiverBank != this.userInfo.bank_account.bank_name)));

        let payoutRequest = {
            receiverName:this.receiverName,
            receiverBank:this.receiverBank,
            receiverAccount:this.receiverAccount,
            dateFrom:this.payout.from,
            dateTo:this.payout.to,
            currencyCode:this.payout.currency_code,
            amount:this.payout.balance,
            saveAccount: save ? 1 : 0
        };
        this.showLoading().then(()=>{
            Api.addPayoutRequest(payoutRequest, (status, result) => {
                this.hideLoading();
                if (status) {
                    this.showToastMsg(result.msg, ToastType.SUCCESS);
                    this.loadPayout();
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
}
