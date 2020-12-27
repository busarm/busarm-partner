import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareBusPage } from './share-bus.page';

describe('ShareBusPage', () => {
  let component: ShareBusPage;
  let fixture: ComponentFixture<ShareBusPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareBusPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareBusPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
