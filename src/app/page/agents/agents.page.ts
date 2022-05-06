import { Component } from "@angular/core";
import { IonToggle, ModalController } from "@ionic/angular";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { PageController } from "../page-controller";
import { User } from "../../models/User/User";
import { ToastType } from "../../services/app/AlertService";
import { Api } from "../../helpers/Api";
import { Strings } from "../../resources";
import { AddAgentPage } from "./add-agent/add-agent.page";
import { Subject } from "rxjs";

@Component({
  selector: "app-view-agents",
  templateUrl: "./agents.page.html",
  styleUrls: ["./agents.page.scss"],
})
export class AgentsPage extends PageController {
  searchText: string = null;
  agents: User[] = null;
  currentAgents: User[] = null;

  public readonly updated = new Subject<string>();

  constructor(public modalCtrl: ModalController, private iab: InAppBrowser) {
    super();
  }

  public async ngOnInit() {
    await super.ngOnInit();

    /*User updated event*/
    this.subscriptions.add(
      this.updated.asObservable().subscribe(async (id) => {
        await super.ngOnInit();
        if (
          !this.agents ||
          (this.agents &&
            (!id || this.agents.some((agent) => agent.agent_id === id)))
        ) {
          this.loadAgentsView();
        }
      })
    );
  }

  public async ionViewDidEnter() {
    if (this.user && (this.user.is_admin || this.user.is_partner)) {
      this.loadAgentsView(async () => {
        let params = await this.getRouteParams();
        if (params && params.agent_id) {
          this.filterAgents(params.agent_id);
        }
      });
    }
  }

  /**Search input event
   * */
  public onInput(event, isSearch?) {
    if (event.isTrusted) {
      this.searchText = event.target.value;
      if (this.assertAvailable(this.searchText) && this.searchText.length > 1) {
        this.filterAgents(this.searchText);
      } else {
        this.onClear(event);
      }
    }
  }

  /**Filter
   * */
  public filterAgents(search: string) {
    if (search && this.assertAvailable(this.agents)) {
      this.currentAgents = this.agents.filter((agent) => {
        let reg = new RegExp(search, "gi");
        return (
          search === agent.agent_id ||
          agent.name.match(reg) ||
          agent.email.match(reg)
        );
      });
    }
  }

  /**Reset Search bar*/
  public onClear(event) {
    if (event.isTrusted) {
      this.searchText = null;
      this.currentAgents = this.agents;
    }
  }

  /**Refresh View*/
  public refreshAgentsView(event?) {
    this.loadAgentsView(() => {
      if (event) {
        event.target.complete();
      }
    });
  }

  /**Load Agents View*/
  public loadAgentsView(completed?: () => any) {
    /*Get Agents*/
    Api.getAgents(({ status, result, msg }) => {
      if (status) {
        if (this.assertAvailable(result)) {
          this.agents = this.currentAgents = result.data;
        } else {
          this.showToastMsg(
            Strings.getString("error_unexpected"),
            ToastType.ERROR
          );
        }
      } else {
        this.showToastMsg(msg, ToastType.ERROR);
      }

      if (this.assertAvailable(completed)) {
        completed();
      }
    }, false);
  }

  /**Launch add user page*/
  async showAddAgent() {
    let chooseModal = await this.modalCtrl.create({
      component: AddAgentPage,
    });
    chooseModal.onDidDismiss().then((data) => {
      if (data.data) {
        this.updated.next();
        this.events.userUpdated.next();
      }
    });
    return await chooseModal.present();
  }

  /**Show Delete confirmation
   * */
  public confirmDeleteAgent(user: User) {
    this.showAlert(
      this.strings.getString("delete_agent_title_txt"),
      this.strings.getString("delete_agent_msg_txt"),
      {
        title: this.strings.getString("no_txt"),
      },
      {
        title: this.strings.getString("yes_txt"),
        callback: () => {
          this.deleteAgent(user);
        },
      }
    );
  }

  /**Delete Agent*/
  public deleteAgent(user: User) {
    this.showLoading().then(() => {
      Api.deleteAgent(user.agent_id, ({ status, result, msg }) => {
        this.hideLoading();
        if (status) {
          if (this.assertAvailable(result)) {
            if (result.status) {
              this.updated.next(user.agent_id);
              this.events.userUpdated.next(user.agent_id);
              this.showToastMsg(result.msg, ToastType.SUCCESS);
            } else {
              this.showToastMsg(result.msg, ToastType.ERROR);
            }
          } else {
            this.showToastMsg(
              Strings.getString("error_unexpected"),
              ToastType.ERROR
            );
          }
        } else {
          this.showToastMsg(msg, ToastType.ERROR);
        }
      });
    });
  }

  /**Toggle Agent active status*/
  public toggleAgent(event: CustomEvent<IonToggle>, user: User) {
    if (user.is_active !== event.detail.checked) {
      user.is_active = event.detail.checked;
      this.showLoading().then(() => {
        Api.toggleAgent(
          user.agent_id,
          Boolean(user.is_active),
          ({ status, result, msg }) => {
            this.hideLoading();
            if (status) {
              if (this.assertAvailable(result)) {
                if (result.status) {
                  this.updated.next(user.agent_id);
                  this.events.userUpdated.next(user.agent_id);
                  this.showToastMsg(result.msg, ToastType.SUCCESS);
                } else {
                  user.is_active = !event.detail.checked;
                  this.showToastMsg(result.msg, ToastType.ERROR);
                }
              } else {
                user.is_active = !event.detail.checked;
                this.showToastMsg(
                  Strings.getString("error_unexpected"),
                  ToastType.ERROR
                );
              }
            } else {
              user.is_active = !event.detail.checked;
              this.showToastMsg(msg, ToastType.ERROR);
            }
          }
        );
      });
    }
  }

  /**Show confirmation
   * */
  public confirmMakeAdmin(user: User) {
    this.showAlert(
      this.strings.getString("make_admin_title_txt"),
      this.strings.getString("make_admin_msg_txt"),
      {
        title: this.strings.getString("no_txt"),
      },
      {
        title: this.strings.getString("yes_txt"),
        callback: () => {
          this.updateAdmin(user.agent_id, 0);
        },
      }
    );
  }

  /**Show confirmation
   * */
  public confirmRemoveAdmin(user: User) {
    this.showAlert(
      this.strings.getString("remove_admin_title_txt"),
      this.strings.getString("remove_admin_msg_txt"),
      {
        title: this.strings.getString("no_txt"),
      },
      {
        title: this.strings.getString("yes_txt"),
        callback: () => {
          this.updateAdmin(user.agent_id, 1);
        },
      }
    );
  }

  /**Update Administrator status for user*/
  public updateAdmin(agentId: string, remove: number) {
    this.showLoading().then(() => {
      Api.updateAdminStatus(agentId, remove, ({ status, result, msg }) => {
        this.hideLoading();
        if (status) {
          if (this.assertAvailable(result)) {
            if (result.status) {
              this.updated.next(agentId);
              this.events.userUpdated.next(agentId);
              this.showToastMsg(result.msg, ToastType.SUCCESS);
            } else {
              this.showToastMsg(result.msg, ToastType.ERROR);
            }
          } else {
            this.showToastMsg(
              Strings.getString("error_unexpected"),
              ToastType.ERROR
            );
          }
        } else {
          this.showToastMsg(msg, ToastType.ERROR);
        }
      });
    });
  }

  /**Show confirmation
   * */
  public confirmForgotPassword(user: User) {
    this.showAlert(
      this.strings.getString("forgot_password_title_txt"),
      this.strings.getString("forgot_password_msg_txt"),
      {
        title: this.strings.getString("no_txt"),
      },
      {
        title: this.strings.getString("yes_txt"),
        callback: () => {
          this.sendAuthorization(user.email);
        },
      }
    );
  }

  /**Send authorization for user*/
  public sendAuthorization(email: string) {
    this.showLoading().then(() => {
      Api.processEmailAuthorization(email, ({ status, result, msg }) => {
        this.hideLoading();
        if (status) {
          if (this.assertAvailable(result)) {
            if (result.status) {
              if (this.assertAvailable(result.data)) {
                this.iab.create(result.data, "_blank", {
                  zoom: "no",
                  hardwareback: "yes",
                });
              }
              this.showToastMsg(result.msg, ToastType.SUCCESS);
            } else {
              this.showToastMsg(result.msg, ToastType.ERROR);
            }
          } else {
            this.showToastMsg(
              Strings.getString("error_unexpected"),
              ToastType.ERROR
            );
          }
        } else {
          this.showToastMsg(msg, ToastType.ERROR);
        }
      });
    });
  }
}
