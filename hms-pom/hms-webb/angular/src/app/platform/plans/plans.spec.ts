import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Plans } from './plans';

describe('Plans', () => {
  let component: Plans;
  let fixture: ComponentFixture<Plans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Plans],
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(Plans);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
