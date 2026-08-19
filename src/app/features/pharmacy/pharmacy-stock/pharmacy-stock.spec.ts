import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacySTOCK } from './pharmacy-stock';

describe('PharmacySTOCK', () => {
  let component: PharmacySTOCK;
  let fixture: ComponentFixture<PharmacySTOCK>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacySTOCK],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacySTOCK);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
