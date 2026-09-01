import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  InventoryItem,
  InventoryCategory,
  InventoryUnit,
  InventoryStatus
} from '../../../shared/models/inventory.model';

import {
  InventoryService
} from '../../../core/services/inventory.service';


@Component({
  selector: 'app-inventory-register',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './inventory-register.html',

  styleUrl: './inventory-register.css'
})
export class InventoryRegister {


  // =====================================================
  // INVENTORY ITEM
  // =====================================================

  item: InventoryItem = {

    id: '',

    itemName: '',

    itemCode: '',

    category: 'Other',

    unit: 'Piece',

    description: '',

    quantity: 0,

    minimumStock: 0,

    maximumStock: 0,

    unitPrice: 0,

    supplier: '',

    supplierContact: '',

    batchNumber: '',

    expiryDate: '',

    storageLocation: '',

    status: 'In Stock',

    notes: '',

    createdAt:
      new Date().toISOString()

  };


  // =====================================================
  // CATEGORIES
  // =====================================================

  categories: InventoryCategory[] = [

    'Medicine',

    'Medical Supplies',

    'Laboratory Supplies',

    'Equipment',

    'Consumables',

    'Other'

  ];


  // =====================================================
  // UNITS
  // =====================================================

  units: InventoryUnit[] = [

    'Piece',

    'Box',

    'Pack',

    'Bottle',

    'Vial',

    'Tablet',

    'Capsule',

    'Pair',

    'Set',

    'Roll',

    'Other'

  ];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private inventoryService: InventoryService,
    private router: Router
  ) {}


  // =====================================================
  // SAVE ITEM
  // =====================================================

  saveItem(): void {

    // -----------------------------------------------------
    // ITEM NAME
    // -----------------------------------------------------

    if (
      !this.item.itemName.trim()
    ) {

      alert(
        'Please enter the inventory item name.'
      );

      return;

    }


    // -----------------------------------------------------
    // CATEGORY
    // -----------------------------------------------------

    if (
      !this.item.category
    ) {

      alert(
        'Please select an inventory category.'
      );

      return;

    }


    // -----------------------------------------------------
    // UNIT
    // -----------------------------------------------------

    if (
      !this.item.unit
    ) {

      alert(
        'Please select the inventory unit.'
      );

      return;

    }


    // -----------------------------------------------------
    // QUANTITY
    // -----------------------------------------------------

    if (
      this.item.quantity < 0
    ) {

      alert(
        'Quantity cannot be negative.'
      );

      return;

    }


    // -----------------------------------------------------
    // MINIMUM STOCK
    // -----------------------------------------------------

    if (
      this.item.minimumStock < 0
    ) {

      alert(
        'Minimum stock cannot be negative.'
      );

      return;

    }


    // -----------------------------------------------------
    // MAXIMUM STOCK
    // -----------------------------------------------------

    if (
      this.item.maximumStock !== undefined &&
      this.item.maximumStock > 0 &&
      this.item.maximumStock <
      this.item.minimumStock
    ) {

      alert(
        'Maximum stock cannot be less than minimum stock.'
      );

      return;

    }


    // -----------------------------------------------------
    // UNIT PRICE
    // -----------------------------------------------------

    if (
      this.item.unitPrice < 0
    ) {

      alert(
        'Unit price cannot be negative.'
      );

      return;

    }


    // -----------------------------------------------------
    // GENERATE ID
    // -----------------------------------------------------

    this.item.id =
      this.generateId();


    // -----------------------------------------------------
    // GENERATE ITEM CODE
    // -----------------------------------------------------

    if (
      !this.item.itemCode.trim()
    ) {

      this.item.itemCode =
        this.generateItemCode();

    }


    // -----------------------------------------------------
    // DETERMINE STATUS
    // -----------------------------------------------------

    this.item.status =
      this.calculateStatus();


    // -----------------------------------------------------
    // CREATED DATE
    // -----------------------------------------------------

    this.item.createdAt =
      new Date().toISOString();


    // -----------------------------------------------------
    // SAVE
    // -----------------------------------------------------

    this.inventoryService.addItem(
      this.item
    );


    // -----------------------------------------------------
    // SUCCESS MESSAGE
    // -----------------------------------------------------

    alert(
      'Inventory item registered successfully.'
    );


    // -----------------------------------------------------
    // NAVIGATE
    // -----------------------------------------------------

    this.router.navigate([
      '/inventory'
    ]);

  }


  // =====================================================
  // CALCULATE STATUS
  // =====================================================

  private calculateStatus(): InventoryStatus {

    const quantity =
      this.item.quantity;


    const minimumStock =
      this.item.minimumStock;


    // -----------------------------------------------------
    // OUT OF STOCK
    // -----------------------------------------------------

    if (
      quantity <= 0
    ) {

      return 'Out of Stock';

    }


    // -----------------------------------------------------
    // LOW STOCK
    // -----------------------------------------------------

    if (
      quantity <= minimumStock
    ) {

      return 'Low Stock';

    }


    // -----------------------------------------------------
    // IN STOCK
    // -----------------------------------------------------

    return 'In Stock';

  }


  // =====================================================
  // GENERATE ID
  // =====================================================

  private generateId(): string {

    return (
      'INV-' +
      Date.now().toString()
    );

  }


  // =====================================================
  // GENERATE ITEM CODE
  // =====================================================

  private generateItemCode(): string {

    return (
      'ITEM-' +
      Date.now()
        .toString()
        .slice(-6)
    );

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    this.router.navigate([
      '/inventory'
    ]);

  }

}
