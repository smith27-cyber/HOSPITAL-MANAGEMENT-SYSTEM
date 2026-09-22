
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  InventoryItem,
  InventoryStatus,
  InventoryCategory
} from '../../../shared/models/inventory.model';

import {
  InventoryService
} from '../../../core/services/inventory.service';


@Component({
  selector: 'app-inventory-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './inventory-list.html',

  styleUrl: './inventory-list.css'
})
export class InventoryList implements OnInit {

  // =====================================================
  // INVENTORY
  // =====================================================

  items: InventoryItem[] = [];

  filteredItems: InventoryItem[] = [];


  // =====================================================
  // LOADING STATE
  // =====================================================

  isLoading = false;

  loadError = false;


  // =====================================================
  // SEARCH
  // =====================================================

  searchTerm = '';


  // =====================================================
  // FILTERS
  // =====================================================

  selectedStatus:
    InventoryStatus | 'All' = 'All';

  selectedCategory:
    InventoryCategory | 'All' = 'All';


  // =====================================================
  // STATISTICS
  // =====================================================

  totalItems = 0;

  totalQuantity = 0;

  lowStockItems = 0;

  outOfStockItems = 0;

  expiredItems = 0;

  totalStockValue = 0;


  // =====================================================
  // OPTIONS
  // =====================================================

  statuses: InventoryStatus[] = [

    'In Stock',

    'Low Stock',

    'Out of Stock',

    'Expired',

    'Discontinued'

  ];


  categories: InventoryCategory[] = [

    'Medicine',

    'Medical Supplies',

    'Laboratory Supplies',

    'Equipment',

    'Consumables',

    'Other'

  ];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private inventoryService: InventoryService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
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

    this.isLoading = true;

    this.loadError = false;


    this.inventoryService
      .getItems()
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: (
          items: InventoryItem[]
        ) => {

          this.items = [
            ...items
          ];


          this.updateStatistics();

          this.applyFilters();


          this.isLoading = false;

          this.loadError = false;


          this.changeDetectorRef.detectChanges();

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to load inventory:',
            error
          );


          this.items = [];

          this.filteredItems = [];


          this.totalItems = 0;

          this.totalQuantity = 0;

          this.lowStockItems = 0;

          this.outOfStockItems = 0;

          this.expiredItems = 0;

          this.totalStockValue = 0;


          this.isLoading = false;

          this.loadError = true;


          this.changeDetectorRef.detectChanges();

        }

      });

  }


  // =====================================================
  // REFRESH INVENTORY
  // =====================================================

  refreshInventory(): void {

    this.loadInventory();

  }


  // =====================================================
  // STATISTICS
  // =====================================================

  private updateStatistics(): void {

    this.totalItems =
      this.items.length;


    this.totalQuantity =
      this.items.reduce(
        (
          total: number,
          item: InventoryItem
        ) => {

          return (
            total +
            Number(item.quantity || 0)
          );

        },
        0
      );


    this.lowStockItems =
      this.items.filter(
        (
          item: InventoryItem
        ) => {

          return (
            this.getItemStatus(item) ===
            'Low Stock'
          );

        }
      ).length;


    this.outOfStockItems =
      this.items.filter(
        (
          item: InventoryItem
        ) => {

          return (
            this.getItemStatus(item) ===
            'Out of Stock'
          );

        }
      ).length;


    this.expiredItems =
      this.items.filter(
        (
          item: InventoryItem
        ) => {

          return (
            this.getItemStatus(item) ===
            'Expired'
          );

        }
      ).length;


    this.totalStockValue =
      this.items.reduce(
        (
          total: number,
          item: InventoryItem
        ) => {

          const quantity =
            Number(item.quantity || 0);

          const unitPrice =
            Number(item.unitPrice || 0);


          return (
            total +
            (
              quantity *
              unitPrice
            )
          );

        },
        0
      );

  }


  // =====================================================
  // GET ITEM STATUS
  // =====================================================

  getItemStatus(
    item: InventoryItem
  ): InventoryStatus {

    return this.inventoryService.calculateStatus(
      item
    );

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

          // =============================================
          // SEARCH
          // =============================================

          const matchesSearch =
            !search ||

            (
              item.itemName ??
              ''
            )
              .toLowerCase()
              .includes(search) ||

            (
              item.itemCode ??
              ''
            )
              .toLowerCase()
              .includes(search) ||

            (
              item.category ??
              ''
            )
              .toLowerCase()
              .includes(search) ||

            (
              item.unit ??
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
              item.batchNumber ??
              ''
            )
              .toLowerCase()
              .includes(search) ||

            (
              item.storageLocation ??
              ''
            )
              .toLowerCase()
              .includes(search);


          // =============================================
          // STATUS
          // =============================================

          const matchesStatus =
            this.selectedStatus === 'All' ||

            this.getItemStatus(item) ===
              this.selectedStatus;


          // =============================================
          // CATEGORY
          // =============================================

          const matchesCategory =
            this.selectedCategory === 'All' ||

            item.category ===
              this.selectedCategory;


          return (
            matchesSearch &&
            matchesStatus &&
            matchesCategory
          );

        }
      );

  }


  // =====================================================
  // REGISTER
  // =====================================================

  registerItem(): void {

    this.router.navigate([
      '/inventory/register'
    ]);

  }


  // =====================================================
  // VIEW
  // =====================================================

  viewItem(
    item: InventoryItem
  ): void {

    this.router.navigate([
      '/inventory',
      item.id
    ]);

  }


  // =====================================================
  // EDIT
  // =====================================================

  editItem(
    item: InventoryItem
  ): void {

    this.router.navigate([
      '/inventory',
      item.id,
      'edit'
    ]);

  }


  // =====================================================
  // STOCK
  // =====================================================

  manageStock(
    item: InventoryItem
  ): void {

    this.router.navigate(
      [
        '/inventory',
        'stock'
      ],
      {
        queryParams: {
          id: item.id
        }
      }
    );

  }


  // =====================================================
  // DELETE
  // =====================================================

  deleteItem(
    item: InventoryItem
  ): void {

    const confirmed =
      confirm(
        `Are you sure you want to delete ${item.itemName}?`
      );


    if (!confirmed) {

      return;

    }


    this.inventoryService
      .deleteItem(
        item.id
      )
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: () => {

          alert(
            'Inventory item deleted successfully.'
          );


          /*
           * Reload from Spring Boot so the frontend
           * always displays the actual database state.
           */

          this.loadInventory();

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to delete inventory item:',
            error
          );


          alert(
            'Unable to delete inventory item.'
          );

        }

      });

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedStatus =
      'All';

    this.selectedCategory =
      'All';


    this.applyFilters();

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
      Number(amount || 0)
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

