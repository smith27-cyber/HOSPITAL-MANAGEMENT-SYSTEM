import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaboratoryRequestForm } from './laboratory-request-form';

describe('LaboratoryRequestForm', () => {
  let component: LaboratoryRequestForm;
  let fixture: ComponentFixture<LaboratoryRequestForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaboratoryRequestForm],
    }).compileComponents();

    fixture = TestBed.createComponent(LaboratoryRequestForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
