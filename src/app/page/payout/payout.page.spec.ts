import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayoutPage } from './payout.page';

describe('PayoutPage', () => {
  let component: PayoutPage;
  let fixture: ComponentFixture<PayoutPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayoutPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayoutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
