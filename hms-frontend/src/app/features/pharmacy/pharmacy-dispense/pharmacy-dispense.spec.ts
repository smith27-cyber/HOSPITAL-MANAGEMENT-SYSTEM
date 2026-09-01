import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacyDispense } from './pharmacy-dispense';

describe('PharmacyDispense', () => {
  let component: PharmacyDispense;
  let fixture: ComponentFixture<PharmacyDispense>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyDispense],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyDispense);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
