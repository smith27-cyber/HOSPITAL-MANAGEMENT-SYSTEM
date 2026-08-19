import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacyEdit } from './pharmacy-edit';

describe('PharmacyEdit', () => {
  let component: PharmacyEdit;
  let fixture: ComponentFixture<PharmacyEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
