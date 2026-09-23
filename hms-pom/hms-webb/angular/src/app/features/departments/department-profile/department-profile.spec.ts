import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DepartmentProfile } from './department-profile';

describe('DepartmentProfile', () => {
  let component: DepartmentProfile;
  let fixture: ComponentFixture<DepartmentProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentProfile],
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
