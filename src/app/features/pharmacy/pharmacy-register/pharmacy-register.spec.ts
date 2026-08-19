import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacyRegister } from './pharmacy-register';

describe('PharmacyRegister', () => {
  let component: PharmacyRegister;
  let fixture: ComponentFixture<PharmacyRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyRegister],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyRegister);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
