import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CreatePlan } from './create-plan';

describe('CreatePlan', () => {
  let component: CreatePlan;
  let fixture: ComponentFixture<CreatePlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePlan],
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePlan);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
