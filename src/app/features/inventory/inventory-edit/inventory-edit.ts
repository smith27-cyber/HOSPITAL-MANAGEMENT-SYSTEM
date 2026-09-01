import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  InventoryItem,
  InventoryCategory,
  InventoryUnit
} from '../../../shared/models/inventory.model';

import {
  InventoryService
} from '../../../core/services/inventory.service';


@Component({
  selector: 'app-inventory-edit',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './inventory-edit.html',

  styleUrl: './inventory-edit.css'
})
export class InventoryEdit implements OnInit {


  // =====================================================
  // ITEM
  // =====================================================

  item: InventoryItem | undefined;


  // =====================================================
  // OPTIONS
  // =====================================================

  categories: InventoryCategory[] = [

    'Medicine',

    'Medical Supplies',

    'Laboratory Supplies',

    'Equipment',

    'Consumables',

    'Other'

  ];


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
    private route: ActivatedRoute,
    private router: Router
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');


    if (!id) {

      this.router.navigate([
        '/inventory'
      ]);

      return;

    }


    const existingItem =
      this.inventoryService.getItemById(id);


    if (!existingItem) {

      alert(
        'Inventory item not found.'
      );

      this.router.navigate([
        '/inventory'
      ]);

      return;

    }


    this.item = {
      ...existingItem
    };

  }


  // =====================================================
  // SAVE
  // =====================================================

  saveItem(): void {

    if (!this.item) {

      return;

    }


    // -----------------------------------------------------
    // ITEM NAME
    // -----------------------------------------------------

    if (
      !this.item.itemName.trim()
    ) {

      alert(
        'Please enter the item name.'
      );

      return;

    }


    // -----------------------------------------------------
    // ITEM CODE
    // -----------------------------------------------------

    if (
      !this.item.itemCode.trim()
    ) {

      alert(
        'Please enter the item code.'
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
      this.item.maximumStock < 0
    ) {

      alert(
        'Maximum stock cannot be negative.'
      );

      return;

    }


    if (
      this.item.maximumStock !== undefined &&
      this.item.maximumStock < this.item.minimumStock
    ) {

      alert(
        'Maximum stock cannot be lower than minimum stock.'
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
    // EXPIRY DATE
    // -----------------------------------------------------

    if (
      this.item.expiryDate
    ) {

      const expiry =
        new Date(
          this.item.expiryDate
        );


      if (
        Number.isNaN(
          expiry.getTime()
        )
      ) {

        alert(
          'Please enter a valid expiry date.'
        );

        return;

      }

    }


    // -----------------------------------------------------
    // UPDATE STATUS
    // -----------------------------------------------------

    this.item.status =
      this.calculateStatus(
        this.item
      );


    // -----------------------------------------------------
    // UPDATE
    // -----------------------------------------------------

    const updated =
      this.inventoryService.updateItem(
        this.item
      );


    if (!updated) {

      alert(
        'Unable to update inventory item.'
      );

      return;

    }


    alert(
      'Inventory item updated successfully.'
    );


    this.router.navigate([
      '/inventory',
      this.item.id
    ]);

  }


  // =====================================================
  // CALCULATE STATUS
  // =====================================================

  private calculateStatus(
    item: InventoryItem
  ): InventoryItem['status'] {

    // -----------------------------------------------------
    // EXPIRY
    // -----------------------------------------------------

    if (
      item.expiryDate
    ) {

      const expiry =
        new Date(
          item.expiryDate
        );


      if (
        !Number.isNaN(
          expiry.getTime()
        )
      ) {

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

    }


    // -----------------------------------------------------
    // DISCONTINUED
    // -----------------------------------------------------

    if (
      item.status === 'Discontinued'
    ) {

      return 'Discontinued';

    }


    // -----------------------------------------------------
    // STOCK
    // -----------------------------------------------------

    if (
      item.quantity <= 0
    ) {

      return 'Out of Stock';

    }


    if (
      item.quantity <=
      item.minimumStock
    ) {

      return 'Low Stock';

    }


    return 'In Stock';

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    if (this.item) {

      this.router.navigate([
        '/inventory',
        this.item.id
      ]);

    } else {

      this.router.navigate([
        '/inventory'
      ]);

    }

  }

}
