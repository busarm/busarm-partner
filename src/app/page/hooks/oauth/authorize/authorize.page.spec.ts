import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizePage } from './authorize.page';

describe('AuthorizePage', () => {
  let component: AuthorizePage;
  let fixture: ComponentFixture<AuthorizePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthorizePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorizePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
