import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTicketPage } from './add-ticket.page';

describe('AddTicketPage', () => {
  let component: AddTicketPage;
  let fixture: ComponentFixture<AddTicketPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTicketPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTicketPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
