import { Component, Input, OnInit } from '@angular/core';
import { Assets, Strings } from '../../resources';
@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent implements OnInit {

  @Input() text: String = null;
  @Input() failed: Boolean = false;
  @Input() icon: [String, String] = null;

  //Define resources for views to use
  public strings = Strings;
  public assets = Assets;

  constructor() { }

  ngOnInit() {}

}
