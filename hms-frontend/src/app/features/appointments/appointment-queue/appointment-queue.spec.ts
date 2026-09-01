import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentQueue } from './appointment-queue';

describe('AppointmentQueue', () => {
  let component: AppointmentQueue;
  let fixture: ComponentFixture<AppointmentQueue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentQueue],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentQueue);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
