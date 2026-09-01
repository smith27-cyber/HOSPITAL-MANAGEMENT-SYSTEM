import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaboratoryRequestList } from './laboratory-request-list';

describe('LaboratoryRequestList', () => {
  let component: LaboratoryRequestList;
  let fixture: ComponentFixture<LaboratoryRequestList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaboratoryRequestList],
    }).compileComponents();

    fixture = TestBed.createComponent(LaboratoryRequestList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
