import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTripPage } from './view-trip.page';

describe('ViewTripPage', () => {
  let component: ViewTripPage;
  let fixture: ComponentFixture<ViewTripPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTripPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTripPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
