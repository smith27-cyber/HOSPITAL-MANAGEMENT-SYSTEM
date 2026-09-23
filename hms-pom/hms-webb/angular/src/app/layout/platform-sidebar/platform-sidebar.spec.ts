import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PlatformSidebar } from './platform-sidebar';

describe('PlatformSidebar', () => {
  let component: PlatformSidebar;
  let fixture: ComponentFixture<PlatformSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlatformSidebar],
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(PlatformSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
