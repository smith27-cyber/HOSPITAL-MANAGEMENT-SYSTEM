import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TenantAdmin } from './tenant-admin';

describe('TenantAdmin', () => {
  let component: TenantAdmin;
  let fixture: ComponentFixture<TenantAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantAdmin],
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(TenantAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
