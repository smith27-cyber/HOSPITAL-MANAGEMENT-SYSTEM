import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacyMedicines } from './pharmacy-medicines';

describe('PharmacyMedicines', () => {
  let component: PharmacyMedicines;
  let fixture: ComponentFixture<PharmacyMedicines>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyMedicines],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyMedicines);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
