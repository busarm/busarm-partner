import {Component, Input, OnInit} from '@angular/core';
import {PageController} from "../page-controller";
import {Bank, PaymentMethod, PayOutTransaction} from "../../models/ApiResponse";
import {ToastType, Utils} from "../../libs/Utils";
import {Api} from "../../libs/Api";

@Component({
    selector: 'app-payout',
    templateUrl: './payout.page.html',
    styleUrls: ['./payout.page.scss'],
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
        if(this.userInfo.bank_account){
            this.receiverName = this.userInfo.bank_account.account_name;
            this.receiverAccount = this.userInfo.bank_account.account_number;
            this.receiverBank = this.userInfo.bank_account.bank_name;
            this.receiverBankCode = this.userInfo.bank_account.bank_code;
        }

        if(!this.payout){
            this.loadPayout();
        }
        else {
            if(this.payout.action_required && this.payout.payment_methods && this.payout.payment_methods.length == 1){
                this.selectedMethod = this.payout.payment_methods[0];
                this.selectedMethodId = this.selectedMethod.method_id;
                this.loadBanks(true);
            }
        }
    }

    /**
     * Set selected bank
     */
    public setBank(){
        let bank = this.banks ? this.banks.find((bank) => bank.code == this.receiverBankCode) : null;
        this.receiverBank = bank ? bank.name : null;
    }

    /**
     * Set selected method
     */
    public setMethod(){
        this.selectedMethod = this.payout.payment_methods ? this.payout.payment_methods.find((method) => method.method_id == this.selectedMethodId) : null;
        this.loadBanks();
    }

    /**
     * Load Banks
     */
    private loadBanks(force = false){
        if(!this.selectedMethod) {
            return;
        }
        this.showLoading().then(()=>{
            Api.getBanks(this.session.country.country_code, this.selectedMethod.method_id, async (status, result) =>{
                this.hideLoading();
                if(status){
                    this.banks = result.data;
                }
                else {
                    await this.showToastMsg(result, ToastType.ERROR);
                    if(force){
                        this.instance.goHome();
                    }
                }
            })
        })
    }

    /**
     * Get transfer fee alert
     * @param amount
     */
    public getFeeAlert(){
        if(!this.selectedMethod) return '';
        return this.strings.format(this.strings.getString('payout_fee_alert_txt'), this.payout.currency_code+" "+this.selectedMethod.transfer_minimum);
    }

    /**
     * Get transfer fee
     * @param amount
     */
    public getFee(){
        if(!this.selectedMethod) return '';
        return Utils.parseFloat(this.selectedMethod.transfer_fee) + ((Utils.parseFloat(this.selectedMethod.transfer_fee_percent)/100)*Utils.parseFloat(this.payout.balance));
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
                    if(this.payout.payment_methods && this.payout.payment_methods.length == 1){
                        this.selectedMethod = this.payout.payment_methods[0];
                        this.selectedMethodId = this.selectedMethod.method_id;
                        this.loadBanks(true);
                    }
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
        let save = this.saveAccount && 
                    (!this.userInfo.bank_account || 
                        (this.userInfo.bank_account && 
                            (this.receiverAccount != this.userInfo.bank_account.account_name ||
                                this.receiverAccount != this.userInfo.bank_account.account_number ||
                                this.receiverBank != this.userInfo.bank_account.bank_name ||
                                this.receiverBankCode != this.userInfo.bank_account.bank_code)));

        let payoutRequest = {
            receiverName:this.receiverName,
            receiverBank:this.receiverBank,
            receiverBankCode:this.receiverBankCode,
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
