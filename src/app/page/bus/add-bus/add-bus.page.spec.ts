import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBusPage } from './add-bus.page';

describe('AddBusPage', () => {
  let component: AddBusPage;
  let fixture: ComponentFixture<AddBusPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddBusPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBusPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
