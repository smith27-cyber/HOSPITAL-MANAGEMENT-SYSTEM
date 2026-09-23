import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { InventoryEdit } from './inventory-edit';

describe('InventoryEdit', () => {
  let component: InventoryEdit;
  let fixture: ComponentFixture<InventoryEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryEdit],
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
