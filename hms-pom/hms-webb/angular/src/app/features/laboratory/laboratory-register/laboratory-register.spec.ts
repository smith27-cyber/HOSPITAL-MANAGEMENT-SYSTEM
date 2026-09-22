import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaboratoryRegister } from './laboratory-register';

describe('LaboratoryRegister', () => {
  let component: LaboratoryRegister;
  let fixture: ComponentFixture<LaboratoryRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaboratoryRegister],
    }).compileComponents();

    fixture = TestBed.createComponent(LaboratoryRegister);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
