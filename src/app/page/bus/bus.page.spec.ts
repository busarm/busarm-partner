import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusPage } from './bus.page';

describe('BusPage', () => {
  let component: BusPage;
  let fixture: ComponentFixture<BusPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
