import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBusPage } from './view-bus.page';

describe('ViewBusPage', () => {
  let component: ViewBusPage;
  let fixture: ComponentFixture<ViewBusPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewBusPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewBusPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
