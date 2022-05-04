import { Component, Input, OnInit, Output } from "@angular/core";
import { ModalController, NavParams } from "@ionic/angular";
import { Utils } from "../../helpers/Utils";
import { format } from "date-fns";
import { Assets, Strings } from "../../resources";

@Component({
  selector: "app-select-date",
  templateUrl: "./select-date.page.html",
  styleUrls: ["./select-date.page.scss"],
})
export class SelectDatePage implements OnInit {
  DEFAULT_FORMAT = "yyyy-MM-dd'T'hh:mm:ss.SSSx";

  // Define resources for views to use
  public strings = Strings;
  public assets = Assets;

  @Input() date?: Date = null;
  @Input() minDate?: Date = null;
  @Input() maxDate?: Date = null;
  @Input() type?: DatePickerType = DatePickerType.Date;
  @Output() onComplete?: (date: Date|false|null) => any = null;

  public selectedDate = null;

  constructor(private modalCtrl: ModalController) {}

  public async ngOnInit() {
    this.selectedDate = format(this.date || new Date(), this.DEFAULT_FORMAT);
  }

  /**
   * Return Date string for date
   * */
  public getDateString(selectedDate: Date) {
    if (Utils.assertAvailable(selectedDate)) {
      let year = selectedDate.getFullYear(),
        month = selectedDate.getMonth(),
        day = selectedDate.getDate();
      return year + "-" + Utils.harold(month + 1) + "-" + Utils.harold(day);
    }
    return null;
  }

  /**
   * Return Date string for selected date
   * */
  public getSelectedDateString() {
    return this.getDateString(new Date(this.selectedDate));
  }

  /**Close Modal*/
  dismiss(success = false) {
    let date =
      new Date(this.selectedDate).getTime() > 0 ? this.selectedDate : null;
    this.modalCtrl.dismiss(success && date);
    if (this.onComplete) {
      this.onComplete(success && date);
    }
  }
}

export enum DatePickerType {
  Date = "date",
  DateTime = "date-time",
  Month = "month",
  MonthYear = "month-year",
  Time = "time",
  TimeDate = "time-date",
  Year = "year",
}
