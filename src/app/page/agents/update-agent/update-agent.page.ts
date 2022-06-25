import { Component, Input } from "@angular/core";
import { PageController } from "../../page-controller";
import { ModalController } from "@ionic/angular";
import { User } from "../../../models/User/User";
import { ToastType } from "../../../services/app/AlertService";
import { Api } from "../../../helpers/Api";

@Component({
  selector: 'app-update-agent',
  templateUrl: './update-agent.page.html',
  styleUrls: ['./update-agent.page.scss'],
})
export class UpdateAgentPage extends PageController {

  name: string;
  phone: string;
  dialCode: string;
  partnerName: string;

  constructor(private modalCtrl: ModalController) {
    super();
  }
  public async ngOnInit() {
    await super.ngOnInit();
  }

  public async ionViewDidEnter() {
    this.name = this.user.name;
    this.partnerName = this.user.is_admin || this.user.is_partner ? this.user.partner_name : null;
    this.phone = this.user.phone;
    this.dialCode = this.session.country.dial_code;
  }

  /**Update Agent*/
  public update() {
    // Show Loader
    this.showLoading().then(() => {
      Api.updateAgent({
        name: this.name,
        dial_code: this.dialCode,
        phone: this.phone,
        partner_name: this.partnerName,
      }, ({ status, result, msg }) => {
        this.hideLoading();
        if (status) {
          if (result.status) {
            this.dismiss(true);
            this.events.userUpdated.next();
            this.showToastMsg(result.msg, ToastType.SUCCESS);
          } else {
            this.showToastMsg(result.msg, ToastType.ERROR);
          }
        } else {
          this.showToastMsg(msg, ToastType.ERROR);
        }
      });
    });
  }

  /**Close Modal*/
  async dismiss(updated = false) {
    const modal = await this.modalCtrl.getTop();
    if (modal) modal.dismiss(updated);
  }
}
