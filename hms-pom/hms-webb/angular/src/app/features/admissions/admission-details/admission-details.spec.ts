import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AdmissionDetails } from './admission-details';

describe('AdmissionDetails', () => {
  let component: AdmissionDetails;
  let fixture: ComponentFixture<AdmissionDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmissionDetails],
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(AdmissionDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
