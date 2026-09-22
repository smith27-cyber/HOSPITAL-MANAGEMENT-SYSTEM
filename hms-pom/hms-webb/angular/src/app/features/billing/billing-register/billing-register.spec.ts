import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingRegister } from './billing-register';

describe('BillingRegister', () => {
  let component: BillingRegister;
  let fixture: ComponentFixture<BillingRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingRegister],
    }).compileComponents();

    fixture = TestBed.createComponent(BillingRegister);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
