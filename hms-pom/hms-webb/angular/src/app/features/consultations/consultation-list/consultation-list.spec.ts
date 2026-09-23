import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ConsultationList } from './consultation-list';

describe('ConsultationList', () => {
  let component: ConsultationList;
  let fixture: ComponentFixture<ConsultationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultationList],
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultationList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
