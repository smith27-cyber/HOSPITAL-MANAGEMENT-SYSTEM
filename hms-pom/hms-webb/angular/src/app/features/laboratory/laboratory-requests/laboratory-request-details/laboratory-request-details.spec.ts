import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LaboratoryRequestDetails } from './laboratory-request-details';

describe('LaboratoryRequestDetails', () => {
  let component: LaboratoryRequestDetails;
  let fixture: ComponentFixture<LaboratoryRequestDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaboratoryRequestDetails],
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(LaboratoryRequestDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
