import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchPlacePage } from './search-place.page';

describe('SearchPlacePage', () => {
  let component: SearchPlacePage;
  let fixture: ComponentFixture<SearchPlacePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchPlacePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchPlacePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
