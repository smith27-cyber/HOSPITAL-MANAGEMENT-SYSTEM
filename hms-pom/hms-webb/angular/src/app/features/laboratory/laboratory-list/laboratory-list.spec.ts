import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaboratoryList } from './laboratory-list';

describe('LaboratoryList', () => {
  let component: LaboratoryList;
  let fixture: ComponentFixture<LaboratoryList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaboratoryList],
    }).compileComponents();

    fixture = TestBed.createComponent(LaboratoryList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
