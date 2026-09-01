import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  InventoryItem,
  InventoryStatus
} from '../../../shared/models/inventory.model';

import {
  InventoryService
} from '../../../core/services/inventory.service';


@Component({
  selector: 'app-inventory-stock',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './inventory-stock.html',

  styleUrl: './inventory-stock.css'
})
export class InventoryStock implements OnInit {


  // =====================================================
  // INVENTORY
  // =====================================================

  items: InventoryItem[] = [];

  filteredItems: InventoryItem[] = [];


  // =====================================================
  // SEARCH
  // =====================================================

  searchTerm = '';


  // =====================================================
  // CATEGORY FILTER
  // =====================================================

  selectedCategory = 'All';


  // =====================================================
  // STATUS FILTER
  // =====================================================

  selectedStatus:
    InventoryStatus | 'All' = 'All';


  // =====================================================
  // STOCK ACTION
  // =====================================================

  selectedItem:
    InventoryItem | null = null;

  stockAction:
    'stockIn' |
    'adjust' = 'stockIn';

  stockQuantity = 0;


  // =====================================================
  // STATISTICS
  // =====================================================

  totalItems = 0;

  totalQuantity = 0;

  totalStockValue = 0;

  lowStockItems = 0;

  outOfStockItems = 0;

  expiredItems = 0;


  // =====================================================
  // CATEGORIES
  // =====================================================

  categories: string[] = [];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private inventoryService:
      InventoryService
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadInventory();

  }


  // =====================================================
  // LOAD INVENTORY
  // =====================================================

  loadInventory(): void {

    this.items =
      this.inventoryService.getItems();


    this.buildCategories();

    this.updateStatistics();

    this.applyFilters();

  }


  // =====================================================
  // BUILD CATEGORIES
  // =====================================================

  private buildCategories(): void {

    const categorySet =
      new Set<string>();


    this.items.forEach(
      item => {

        if (
          item.category
        ) {

          categorySet.add(
            item.category
          );

        }

      }
    );


    this.categories = [
      ...categorySet
    ].sort();

  }


  // =====================================================
  // UPDATE STATISTICS
  // =====================================================

  private updateStatistics(): void {

    this.totalItems =
      this.items.length;


    this.totalQuantity =
      this.items.reduce(
        (
          total,
          item
        ) =>
          total +
          item.quantity,
        0
      );


    this.totalStockValue =
      this.inventoryService
        .getTotalStockValue();


    this.lowStockItems =
      this.items.filter(
        item =>
          this.getItemStatus(item) ===
          'Low Stock'
      ).length;


    this.outOfStockItems =
      this.items.filter(
        item =>
          this.getItemStatus(item) ===
          'Out of Stock'
      ).length;


    this.expiredItems =
      this.items.filter(
        item =>
          this.getItemStatus(item) ===
          'Expired'
      ).length;

  }


  // =====================================================
  // APPLY FILTERS
  // =====================================================

  applyFilters(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    this.filteredItems =
      this.items.filter(
        item => {

          const matchesSearch =
            !search ||

            item.itemName
              .toLowerCase()
              .includes(search) ||

            (
              item.batchNumber ??
              ''
            )
              .toLowerCase()
              .includes(search) ||

            (
              item.supplier ??
              ''
            )
              .toLowerCase()
              .includes(search) ||

            (
              item.category ??
              ''
            )
              .toLowerCase()
              .includes(search);


          const matchesCategory =
            this.selectedCategory ===
              'All' ||

            item.category ===
              this.selectedCategory;


          const matchesStatus =
            this.selectedStatus ===
              'All' ||

            this.getItemStatus(item) ===
              this.selectedStatus;


          return (
            matchesSearch &&
            matchesCategory &&
            matchesStatus
          );

        }
      );

  }


  // =====================================================
  // GET ITEM STATUS
  // =====================================================

  getItemStatus(
    item: InventoryItem
  ): InventoryStatus {

    return this.calculateStatus(
      item
    );

  }


  // =====================================================
  // CALCULATE STATUS
  // =====================================================

  private calculateStatus(
    item: InventoryItem
  ): InventoryStatus {

    if (
      item.expiryDate
    ) {

      const expiry =
        new Date(
          item.expiryDate
        );


      const today =
        new Date();


      expiry.setHours(
        0,
        0,
        0,
        0
      );


      today.setHours(
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
  // STATUS CLASS
  // =====================================================

  getStatusClass(
    status: InventoryStatus
  ): string {

    switch (status) {

      case 'In Stock':
        return 'in-stock';

      case 'Low Stock':
        return 'low-stock';

      case 'Out of Stock':
        return 'out-of-stock';

      case 'Expired':
        return 'expired';

      default:
        return '';

    }

  }


  // =====================================================
  // OPEN STOCK IN
  // =====================================================

  openStockIn(
    item: InventoryItem
  ): void {

    this.selectedItem =
      item;


    this.stockAction =
      'stockIn';


    this.stockQuantity =
      0;

  }


  // =====================================================
  // OPEN STOCK ADJUSTMENT
  // =====================================================

  openAdjustment(
    item: InventoryItem
  ): void {

    this.selectedItem =
      item;


    this.stockAction =
      'adjust';


    this.stockQuantity =
      item.quantity;

  }


  // =====================================================
  // CLOSE STOCK ACTION
  // =====================================================

  closeStockAction(): void {

    this.selectedItem =
      null;


    this.stockQuantity =
      0;

  }


  // =====================================================
  // PROCESS STOCK ACTION
  // =====================================================

  processStockAction(): void {

    if (
      !this.selectedItem
    ) {

      return;

    }


    if (
      !Number.isInteger(
        this.stockQuantity
      )
    ) {

      alert(
        'Please enter a valid whole number.'
      );

      return;

    }


    const item =
      this.selectedItem;


    // ===================================================
    // STOCK IN
    // ===================================================

    if (
      this.stockAction ===
      'stockIn'
    ) {

      if (
        this.stockQuantity <= 0
      ) {

        alert(
          'Stock-in quantity must be greater than zero.'
        );

        return;

      }


      const success =
        this.inventoryService.stockIn(
          item.id,
          this.stockQuantity,
          'Inventory stock received',
          item.batchNumber,
          'Inventory'
        );


      if (!success) {

        alert(
          'Unable to add stock.'
        );

        return;

      }


      alert(
        `${item.itemName} stock updated successfully.`
      );

    }


    // ===================================================
    // STOCK ADJUSTMENT
    // ===================================================

    else {

      if (
        this.stockQuantity < 0
      ) {

        alert(
          'Stock quantity cannot be negative.'
        );

        return;

      }


      const success =
        this.inventoryService.adjustStock(
          item.id,
          this.stockQuantity,
          'Inventory stock adjustment',
          item.batchNumber,
          'Inventory'
        );


      if (!success) {

        alert(
          'Unable to adjust stock.'
        );

        return;

      }


      alert(
        `${item.itemName} stock adjusted successfully.`
      );

    }


    this.closeStockAction();

    this.loadInventory();

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedCategory =
      'All';

    this.selectedStatus =
      'All';


    this.applyFilters();

  }


  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  formatCurrency(
    amount: number
  ): string {

    return new Intl.NumberFormat(
      'en-UG',
      {
        style: 'currency',
        currency: 'UGX',
        maximumFractionDigits: 0
      }
    ).format(
      amount || 0
    );

  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDate(
    date?: string
  ): string {

    if (!date) {

      return '—';

    }


    const parsedDate =
      new Date(date);


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return '—';

    }


    return new Intl.DateTimeFormat(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    ).format(
      parsedDate
    );

  }

}
