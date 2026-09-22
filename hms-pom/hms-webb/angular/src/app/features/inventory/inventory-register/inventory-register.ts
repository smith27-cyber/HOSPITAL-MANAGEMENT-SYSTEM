// =====================================================
// INVENTORY REGISTER COMPONENT
// File:
// src/app/features/inventory/inventory-register/inventory-register.ts
// =====================================================

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

    createdAt: new Date().toISOString()

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
  // SAVING STATE
  // =====================================================

  isSaving = false;


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

    // ---------------------------------------------------
    // PREVENT DOUBLE SUBMISSION
    // ---------------------------------------------------

    if (this.isSaving) {
      return;
    }


    // ---------------------------------------------------
    // ITEM NAME
    // ---------------------------------------------------

    const itemName =
      this.item.itemName?.trim() || '';

    if (!itemName) {

      alert(
        'Please enter the inventory item name.'
      );

      return;

    }

    this.item.itemName =
      itemName;


    // ---------------------------------------------------
    // CATEGORY
    // ---------------------------------------------------

    if (!this.item.category) {

      alert(
        'Please select an inventory category.'
      );

      return;

    }


    // ---------------------------------------------------
    // UNIT
    // ---------------------------------------------------

    if (!this.item.unit) {

      alert(
        'Please select the inventory unit.'
      );

      return;

    }


    // ---------------------------------------------------
    // NUMERIC VALUES
    // ---------------------------------------------------

    const quantity =
      Number(this.item.quantity) || 0;

    const minimumStock =
      Number(this.item.minimumStock) || 0;

    const maximumStock =
      Number(this.item.maximumStock) || 0;

    const unitPrice =
      Number(this.item.unitPrice) || 0;


    // ---------------------------------------------------
    // VALIDATE QUANTITY
    // ---------------------------------------------------

    if (quantity < 0) {

      alert(
        'Quantity cannot be negative.'
      );

      return;

    }


    // ---------------------------------------------------
    // VALIDATE MINIMUM STOCK
    // ---------------------------------------------------

    if (minimumStock < 0) {

      alert(
        'Minimum stock cannot be negative.'
      );

      return;

    }


    // ---------------------------------------------------
    // VALIDATE MAXIMUM STOCK
    // ---------------------------------------------------

    if (maximumStock < 0) {

      alert(
        'Maximum stock cannot be negative.'
      );

      return;

    }


    if (
      maximumStock > 0 &&
      maximumStock < minimumStock
    ) {

      alert(
        'Maximum stock cannot be less than minimum stock.'
      );

      return;

    }


    // ---------------------------------------------------
    // VALIDATE UNIT PRICE
    // ---------------------------------------------------

    if (unitPrice < 0) {

      alert(
        'Unit price cannot be negative.'
      );

      return;

    }


    // ---------------------------------------------------
    // SAVE NUMERIC VALUES
    // ---------------------------------------------------

    this.item.quantity =
      quantity;

    this.item.minimumStock =
      minimumStock;

    this.item.maximumStock =
      maximumStock;

    this.item.unitPrice =
      unitPrice;


    // ---------------------------------------------------
    // CLEAN OPTIONAL VALUES
    // ---------------------------------------------------

    this.item.description =
      this.item.description?.trim() || '';

    this.item.supplier =
      this.item.supplier?.trim() || '';

    this.item.supplierContact =
      this.item.supplierContact?.trim() || '';

    this.item.batchNumber =
      this.item.batchNumber?.trim() || '';

    this.item.storageLocation =
      this.item.storageLocation?.trim() || '';

    this.item.notes =
      this.item.notes?.trim() || '';


    // ---------------------------------------------------
    // ITEM CODE
    // ---------------------------------------------------

    const itemCode =
      this.item.itemCode?.trim() || '';

    if (itemCode) {

      this.item.itemCode =
        itemCode.toUpperCase();

    } else {

      // Backend will generate the item code.
      this.item.itemCode = '';

    }


    // ---------------------------------------------------
    // ID
    // ---------------------------------------------------

    // Backend generates the ID if empty.
    this.item.id = '';


    // ---------------------------------------------------
    // STATUS
    // ---------------------------------------------------

    this.item.status =
      this.calculateStatus();


    // ---------------------------------------------------
    // CREATED DATE
    // ---------------------------------------------------

    this.item.createdAt =
      new Date().toISOString();


    // ---------------------------------------------------
    // START SAVING
    // ---------------------------------------------------

    this.isSaving = true;


    // ---------------------------------------------------
    // SEND TO SPRING BOOT
    // ---------------------------------------------------

    this.inventoryService
      .addItem(this.item)
      .subscribe({

        // -----------------------------------------------
        // SUCCESS
        // -----------------------------------------------

        next: (savedItem: InventoryItem) => {

          console.log(
            'Inventory item saved successfully:',
            savedItem
          );

          this.isSaving = false;

          alert(
            'Inventory item registered successfully.'
          );

          this.router.navigate([
            '/inventory'
          ]);

        },


        // -----------------------------------------------
        // ERROR
        // -----------------------------------------------

        error: (error: unknown) => {

          console.error(
            'Failed to save inventory item:',
            error
          );

          this.isSaving = false;

          let message =
            'Failed to register inventory item.';


          // ---------------------------------------------
          // HTTP ERROR RESPONSE
          // ---------------------------------------------

          if (
            typeof error === 'object' &&
            error !== null
          ) {

            const httpError =
              error as {
                error?: unknown;
                message?: string;
              };


            if (
              typeof httpError.error === 'object' &&
              httpError.error !== null
            ) {

              const backendError =
                httpError.error as {
                  message?: string;
                };


              if (
                backendError.message
              ) {

                message =
                  backendError.message;

              }

            } else if (
              typeof httpError.error === 'string'
            ) {

              message =
                httpError.error;

            } else if (
              httpError.message
            ) {

              message =
                httpError.message;

            }

          }


          alert(
            message
          );

        }

      });

  }


  // =====================================================
  // CALCULATE STATUS
  // =====================================================

  private calculateStatus(): InventoryStatus {

    const quantity =
      Number(this.item.quantity) || 0;

    const minimumStock =
      Number(this.item.minimumStock) || 0;


    // ---------------------------------------------------
    // EXPIRY
    // ---------------------------------------------------

    if (
      this.item.expiryDate
    ) {

      const expiry =
        new Date(
          this.item.expiryDate
        );

      const today =
        new Date();


      today.setHours(
        0,
        0,
        0,
        0
      );


      expiry.setHours(
        0,
        0,
        0,
        0
      );


      if (
        expiry < today
      ) {

        return 'Expired';

      }

    }


    // ---------------------------------------------------
    // OUT OF STOCK
    // ---------------------------------------------------

    if (
      quantity <= 0
    ) {

      return 'Out of Stock';

    }


    // ---------------------------------------------------
    // LOW STOCK
    // ---------------------------------------------------

    if (
      quantity <= minimumStock
    ) {

      return 'Low Stock';

    }


    // ---------------------------------------------------
    // IN STOCK
    // ---------------------------------------------------

    return 'In Stock';

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
