import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacyQueue } from './pharmacy-queue';

describe('PharmacyQueue', () => {
  let component: PharmacyQueue;
  let fixture: ComponentFixture<PharmacyQueue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyQueue],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyQueue);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
