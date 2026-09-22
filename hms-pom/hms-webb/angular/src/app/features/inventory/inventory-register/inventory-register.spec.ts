import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryRegister } from './inventory-register';

describe('InventoryRegister', () => {
  let component: InventoryRegister;
  let fixture: ComponentFixture<InventoryRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryRegister],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryRegister);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
