import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AdmissionEdit } from './admission-edit';

describe('AdmissionEdit', () => {
  let component: AdmissionEdit;
  let fixture: ComponentFixture<AdmissionEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmissionEdit],
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(AdmissionEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
