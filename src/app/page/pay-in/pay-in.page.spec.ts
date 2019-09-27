import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayInPage } from './pay-in.page';

describe('PayInPage', () => {
  let component: PayInPage;
  let fixture: ComponentFixture<PayInPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayInPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayInPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
