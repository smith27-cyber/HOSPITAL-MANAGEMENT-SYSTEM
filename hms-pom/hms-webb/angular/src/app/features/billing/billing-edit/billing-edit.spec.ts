import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BillingEdit } from './billing-edit';

describe('BillingEdit', () => {
  let component: BillingEdit;
  let fixture: ComponentFixture<BillingEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingEdit],
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(BillingEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
