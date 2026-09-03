
// =====================================================
// INVENTORY STOCK COMPONENT
// File:
// src/app/features/inventory/inventory-stock/inventory-stock.ts
// =====================================================

import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

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
  // LOADING
  // =====================================================

  loading = false;

  actionLoading = false;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage = '';


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
    private inventoryService: InventoryService,

    private cdr: ChangeDetectorRef
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

    this.loading = true;

    this.errorMessage = '';


    this.inventoryService
      .getItems()
      .subscribe({

        // -------------------------------------------------
        // SUCCESS
        // -------------------------------------------------

        next: (
          items: InventoryItem[]
        ) => {

          this.items = [
            ...items
          ];

          this.buildCategories();

          this.updateStatistics();

          this.applyFilters();

          this.loading = false;


          // Ensure immediate UI refresh
          this.cdr.detectChanges();

        },


        // -------------------------------------------------
        // ERROR
        // -------------------------------------------------

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to load inventory:',
            error
          );


          this.items = [];

          this.filteredItems = [];

          this.categories = [];


          this.totalItems = 0;

          this.totalQuantity = 0;

          this.totalStockValue = 0;

          this.lowStockItems = 0;

          this.outOfStockItems = 0;

          this.expiredItems = 0;


          this.loading = false;


          this.errorMessage =
            'Unable to load inventory from the server.';


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // BUILD CATEGORIES
  // =====================================================

  private buildCategories(): void {

    const categorySet =
      new Set<string>();


    this.items.forEach(
      (
        item: InventoryItem
      ) => {

        if (
          item.category &&
          item.category.trim()
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
          total: number,
          item: InventoryItem
        ) =>
          total +
          Number(
            item.quantity || 0
          ),
        0
      );


    this.totalStockValue =
      this.items.reduce(
        (
          total: number,
          item: InventoryItem
        ) =>
          total +
          (
            Number(
              item.quantity || 0
            ) *
            Number(
              item.unitPrice || 0
            )
          ),
        0
      );


    this.lowStockItems =
      this.items.filter(
        (
          item: InventoryItem
        ) =>
          this.getItemStatus(item) ===
          'Low Stock'
      ).length;


    this.outOfStockItems =
      this.items.filter(
        (
          item: InventoryItem
        ) =>
          this.getItemStatus(item) ===
          'Out of Stock'
      ).length;


    this.expiredItems =
      this.items.filter(
        (
          item: InventoryItem
        ) =>
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
        (
          item: InventoryItem
        ) => {

          const itemName =
            (
              item.itemName ||
              ''
            ).toLowerCase();


          const itemCode =
            (
              item.itemCode ||
              ''
            ).toLowerCase();


          const category =
            (
              item.category ||
              ''
            ).toLowerCase();


          const unit =
            (
              item.unit ||
              ''
            ).toLowerCase();


          const supplier =
            (
              item.supplier ||
              ''
            ).toLowerCase();


          const batchNumber =
            (
              item.batchNumber ||
              ''
            ).toLowerCase();


          const storageLocation =
            (
              item.storageLocation ||
              ''
            ).toLowerCase();


          const matchesSearch =
            !search ||

            itemName.includes(search) ||

            itemCode.includes(search) ||

            category.includes(search) ||

            unit.includes(search) ||

            supplier.includes(search) ||

            batchNumber.includes(search) ||

            storageLocation.includes(search);


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

    return this.inventoryService
      .calculateStatus(
        item
      );

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


      case 'Discontinued':
        return 'discontinued';


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

    this.actionLoading =
      false;

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
      Number(
        item.quantity || 0
      );

    this.actionLoading =
      false;

  }


  // =====================================================
  // CLOSE STOCK ACTION
  // =====================================================

  closeStockAction(): void {

    if (this.actionLoading) {

      return;

    }


    this.selectedItem =
      null;

    this.stockQuantity =
      0;

    this.actionLoading =
      false;

  }


  // =====================================================
  // PROCESS STOCK ACTION
  // =====================================================

  processStockAction(): void {

    if (
      !this.selectedItem ||
      this.actionLoading
    ) {

      return;

    }


    if (
      !Number.isInteger(
        Number(this.stockQuantity)
      )
    ) {

      alert(
        'Please enter a valid whole number.'
      );

      return;

    }


    const quantity =
      Number(
        this.stockQuantity
      );


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
        quantity <= 0
      ) {

        alert(
          'Stock-in quantity must be greater than zero.'
        );

        return;

      }


      this.actionLoading = true;


      this.inventoryService
        .stockIn(
          item.id,
          quantity,
          'Inventory stock received',
          item.batchNumber,
          'Inventory'
        )
        .subscribe({

          next: (
            updatedItem: InventoryItem
          ) => {

            this.actionLoading =
              false;


            alert(
              `${item.itemName} stock updated successfully.`
            );


            this.closeStockAction();


            // Reload from backend so every
            // component receives the latest data.
            this.loadInventory();

          },


          error: (
            error: unknown
          ) => {

            console.error(
              'Failed to add inventory stock:',
              error
            );


            this.actionLoading =
              false;


            alert(
              this.getErrorMessage(
                error,
                'Unable to add stock.'
              )
            );


            this.cdr.detectChanges();

          }

        });


      return;

    }


    // ===================================================
    // STOCK ADJUSTMENT
    // ===================================================

    if (
      quantity < 0
    ) {

      alert(
        'Stock quantity cannot be negative.'
      );

      return;

    }


    this.actionLoading = true;


    this.inventoryService
      .adjustStock(
        item.id,
        quantity,
        'Inventory stock adjustment',
        item.batchNumber,
        'Inventory'
      )
      .subscribe({

        next: (
          updatedItem: InventoryItem
        ) => {

          this.actionLoading =
            false;


          alert(
            `${item.itemName} stock adjusted successfully.`
          );


          this.closeStockAction();


          // Always get the latest backend state.
          this.loadInventory();

        },


        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to adjust inventory stock:',
            error
          );


          this.actionLoading =
            false;


          alert(
            this.getErrorMessage(
              error,
              'Unable to adjust stock.'
            )
          );


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // REFRESH
  // =====================================================

  refresh(): void {

    if (
      this.loading ||
      this.actionLoading
    ) {

      return;

    }


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

    this.cdr.detectChanges();

  }


  // =====================================================
  // ERROR MESSAGE
  // =====================================================

  private getErrorMessage(
    error: unknown,
    fallback: string
  ): string {

    if (
      typeof error === 'object' &&
      error !== null
    ) {

      const httpError =
        error as {
          error?: {
            message?: string;
          };
          message?: string;
        };


      if (
        httpError.error?.message
      ) {

        return httpError.error.message;

      }


      if (
        httpError.message
      ) {

        return httpError.message;

      }

    }


    return fallback;

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
      Number(amount) || 0
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

