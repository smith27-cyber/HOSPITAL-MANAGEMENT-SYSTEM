import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LaboratoryDetails } from './laboratory-details';

describe('LaboratoryDetails', () => {
  let component: LaboratoryDetails;
  let fixture: ComponentFixture<LaboratoryDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaboratoryDetails],
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(LaboratoryDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
