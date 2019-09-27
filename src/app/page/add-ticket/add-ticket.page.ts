import {Component, Input} from '@angular/core';
import {PageController} from "../page-controller";
import {ModalController, NavController} from "@ionic/angular";
import {Country, TicketInfo, TicketType} from "../../models/ApiResponse";
import {ToastType, Utils} from "../../utils/Utils";
import {Api} from "../../utils/Api";

@Component({
    selector: 'app-add-ticket',
    templateUrl: './add-ticket.page.html',
    styleUrls: ['./add-ticket.page.scss'],
})
export class AddTicketPage extends PageController {

    @Input() ticketTypes: TicketType[];
    @Input() country: Country;
    @Input() selectedTicketType: number;

    ticket: TicketInfo = null;
    ticketPrice: number;

    updated:boolean = false;

    constructor(private modalCtrl: ModalController,
                public navCtrl: NavController) {
        super();
    }

    public async ngOnInit() {}
    public ionViewDidEnter(){}

    /**Add Ticket*/
    public add(){

        if (Utils.assertAvailable(this.selectedTicketType)) {

            if (Utils.assertAvailable(this.ticketPrice)) {

                for (let i = 0; i<this.ticketTypes.length; i++){
                    let type = this.ticketTypes[i];
                    if (type.id == String(this.selectedTicketType)){
                        this.ticket = {
                            ticket_id:"",
                            type_id: type.id,
                            name:type.name,
                            description:type.description,
                            currency_code: this.country.currency_code,
                            price: String(this.ticketPrice),
                        };
                        break;
                    }
                }

                if (this.ticket) {
                    this.dismiss();
                }
            }
            else{
                this.showToastMsg(this.strings.getString('enter_ticket_price_txt'), ToastType.ERROR);
            }
        }
        else{
            this.showToastMsg(this.strings.getString('select_ticket_type_txt'), ToastType.ERROR);
        }
    }

    /**Close Modal*/
    dismiss(){
        this.modalCtrl.dismiss(this.ticket)
    }
}
