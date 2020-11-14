import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectStatusPage } from './select-status.page';

describe('SelectStatusPage', () => {
  let component: SelectStatusPage;
  let fixture: ComponentFixture<SelectStatusPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectStatusPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectStatusPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
