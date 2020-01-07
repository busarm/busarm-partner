import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTripPage } from './add-trip.page';

describe('AddTripPage', () => {
  let component: AddTripPage;
  let fixture: ComponentFixture<AddTripPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTripPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTripPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
