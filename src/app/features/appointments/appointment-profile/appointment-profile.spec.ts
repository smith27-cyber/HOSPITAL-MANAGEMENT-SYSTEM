import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentProfile } from './appointment-profile';

describe('AppointmentProfile', () => {
  let component: AppointmentProfile;
  let fixture: ComponentFixture<AppointmentProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
