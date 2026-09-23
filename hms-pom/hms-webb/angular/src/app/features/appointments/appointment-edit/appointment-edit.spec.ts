import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppointmentEdit } from './appointment-edit';

describe('AppointmentEdit', () => {
  let component: AppointmentEdit;
  let fixture: ComponentFixture<AppointmentEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentEdit],
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
