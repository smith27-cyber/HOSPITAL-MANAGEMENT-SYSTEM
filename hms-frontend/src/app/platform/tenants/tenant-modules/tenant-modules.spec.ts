import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TenantModules } from './tenant-modules';

describe('TenantModules', () => {
  let component: TenantModules;
  let fixture: ComponentFixture<TenantModules>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantModules],
    }).compileComponents();

    fixture = TestBed.createComponent(TenantModules);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
