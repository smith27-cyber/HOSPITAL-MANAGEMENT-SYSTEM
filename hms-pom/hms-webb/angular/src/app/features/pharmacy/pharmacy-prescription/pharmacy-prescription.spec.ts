import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacyPrescription } from './pharmacy-prescription';

describe('PharmacyPrescription', () => {
  let component: PharmacyPrescription;
  let fixture: ComponentFixture<PharmacyPrescription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyPrescription],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyPrescription);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
