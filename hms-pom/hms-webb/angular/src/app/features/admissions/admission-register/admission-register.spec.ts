import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmissionRegister } from './admission-register';

describe('AdmissionRegister', () => {
  let component: AdmissionRegister;
  let fixture: ComponentFixture<AdmissionRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmissionRegister],
    }).compileComponents();

    fixture = TestBed.createComponent(AdmissionRegister);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
