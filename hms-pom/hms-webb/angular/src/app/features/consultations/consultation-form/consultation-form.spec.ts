import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ConsultationForm } from './consultation-form';

describe('ConsultationForm', () => {
  let component: ConsultationForm;
  let fixture: ComponentFixture<ConsultationForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultationForm],
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultationForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
