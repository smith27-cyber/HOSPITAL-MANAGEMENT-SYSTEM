import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LaboratoryRegister } from './laboratory-register';

describe('LaboratoryRegister', () => {
  let component: LaboratoryRegister;
  let fixture: ComponentFixture<LaboratoryRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaboratoryRegister],
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(LaboratoryRegister);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
