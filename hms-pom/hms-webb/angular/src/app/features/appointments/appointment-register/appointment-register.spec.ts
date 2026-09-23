import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppointmentRegister } from './appointment-register';

describe('AppointmentRegister', () => {
  let component: AppointmentRegister;
  let fixture: ComponentFixture<AppointmentRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentRegister],
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentRegister);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
