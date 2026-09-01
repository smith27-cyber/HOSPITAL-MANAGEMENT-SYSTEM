import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentProfile } from './department-profile';

describe('DepartmentProfile', () => {
  let component: DepartmentProfile;
  let fixture: ComponentFixture<DepartmentProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
