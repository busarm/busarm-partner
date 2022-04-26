import { Component, Input } from '@angular/core';
import { PageController } from "../../page-controller";
import { ModalController } from "@ionic/angular";
import { TicketType } from "../../../models/Ticket/TicketType";
import { Ticket } from "../../../models/Ticket/Ticket";
import { Country } from "../../../models/Country";
import { ToastType, Utils } from "../../../helpers/Utils";

@Component({
  selector: 'app-add-ticket',
  templateUrl: './add-ticket.page.html',
  styleUrls: ['./add-ticket.page.scss'],
})
export class AddTicketPage extends PageController {

  @Input() country: Country;
  @Input() ticketTypes: TicketType[];
  @Input() selectedTicketType: number;

  ticketPrice: number;

  constructor(private modalCtrl: ModalController) {
    super();
  }

  public async ngOnInit() {
    await super.ngOnInit();
  }
  public ionViewDidEnter() {
    let type = this.ticketTypes.find(type => type.is_default == '1');
    if (type) {
      this.selectedTicketType = Number(type.id);
    }
  }

  /**Add Ticket*/
  public add() {
    if (Utils.assertAvailable(this.selectedTicketType)) {
      if (Utils.assertAvailable(this.ticketPrice)) {
        let type = this.ticketTypes.find(type => type.id == String(this.selectedTicketType));
        if (type) {
          let ticket: Ticket = {
            ticket_id: "",
            type_id: type.id,
            name: type.name,
            description: type.description,
            currency_code: this.country.currency_code,
            price: String(this.ticketPrice),
          };
          this.dismiss(ticket);
        }
      }
      else {
        this.showToastMsg(this.strings.getString('enter_ticket_price_txt'), ToastType.ERROR);
      }
    }
    else {
      this.showToastMsg(this.strings.getString('select_ticket_type_txt'), ToastType.ERROR);
    }
  }

  /**Close Modal*/
  async dismiss(ticket?: Ticket) {
    const modal = await this.modalCtrl.getTop();
    if (modal)
      modal.dismiss(ticket);
  }
}
