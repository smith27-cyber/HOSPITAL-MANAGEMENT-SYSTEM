import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PatientList } from './patient-list';

describe('PatientList', () => {
  let component: PatientList;
  let fixture: ComponentFixture<PatientList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientList],
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
