import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacyAddPrescription } from './pharmacy-add-prescription';

describe('PharmacyAddPrescription', () => {
  let component: PharmacyAddPrescription;
  let fixture: ComponentFixture<PharmacyAddPrescription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyAddPrescription],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyAddPrescription);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
