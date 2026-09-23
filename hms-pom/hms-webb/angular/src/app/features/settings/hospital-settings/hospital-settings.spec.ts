import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalSettingsComponent } from './hospital-settings';

describe('HospitalSettingsComponent', () => {
  let component: HospitalSettingsComponent;
  let fixture: ComponentFixture<HospitalSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HospitalSettingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HospitalSettingsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
