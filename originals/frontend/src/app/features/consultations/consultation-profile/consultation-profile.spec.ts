import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationProfile } from './consultation-profile';

describe('ConsultationProfile', () => {
  let component: ConsultationProfile;
  let fixture: ComponentFixture<ConsultationProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultationProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultationProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
