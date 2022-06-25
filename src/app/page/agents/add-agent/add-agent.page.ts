import { Component, Input } from "@angular/core";
import { PageController } from "../../page-controller";
import { ModalController } from "@ionic/angular";
import { User } from "../../../models/User/User";
import { ToastType } from "../../../services/app/AlertService";
import { Api } from "../../../helpers/Api";

@Component({
  selector: "app-agent-agent",
  templateUrl: "./add-agent.page.html",
  styleUrls: ["./add-agent.page.scss"],
})
export class AddAgentPage extends PageController {

  name: string;
  email: string;
  phone: string;
  dialCode: string;
  isAdmin: boolean;
  isExistingUser: boolean;

  constructor(private modalCtrl: ModalController) {
    super();
  }

  public async ngOnInit() {
    await super.ngOnInit();
  }

  public async ionViewDidEnter() {
    this.dialCode = this.session.country.dial_code;
  }

  /**Add Agent*/
  public add() {
    let user: User;
    if (this.isExistingUser) {
      user = {
        email: this.email,
        is_admin: this.isAdmin ? 1 : 0,
      };
    } else {
      user = {
        name: this.name,
        email: this.email,
        dial_code: this.dialCode,
        phone: this.phone,
        is_admin: this.isAdmin ? 1 : 0,
      };
    }

    // Show Loader
    this.showLoading().then(() => {
      Api.addAgent(user, ({ status, result, msg }) => {
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
