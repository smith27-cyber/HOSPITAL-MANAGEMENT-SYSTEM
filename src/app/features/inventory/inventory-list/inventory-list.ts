
import { Component, OnInit } from '@angular/core';
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
    private router: Router
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

    this.updateStatistics();

    this.applyFilters();

  }


  // =====================================================
  // STATISTICS
  // =====================================================

  private updateStatistics(): void {

    this.totalItems =
      this.inventoryService.getTotalItems();


    this.totalQuantity =
      this.inventoryService.getTotalQuantity();


    this.lowStockItems =
      this.inventoryService
        .getLowStockItems()
        .length;


    this.outOfStockItems =
      this.inventoryService
        .getOutOfStockItems()
        .length;


    this.expiredItems =
      this.inventoryService
        .getExpiredItems()
        .length;


    this.totalStockValue =
      this.inventoryService
        .getTotalStockValue();

  }


  // =====================================================
  // FILTER
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

            item.itemCode
              .toLowerCase()
              .includes(search) ||

            item.category
              .toLowerCase()
              .includes(search) ||

            item.unit
              .toLowerCase()
              .includes(search) ||

            (item.supplier ?? '')
              .toLowerCase()
              .includes(search) ||

            (item.batchNumber ?? '')
              .toLowerCase()
              .includes(search) ||

            (item.storageLocation ?? '')
              .toLowerCase()
              .includes(search);


          const matchesStatus =
            this.selectedStatus === 'All' ||

            item.status ===
              this.selectedStatus;


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

    this.router.navigate([
      '/inventory',
      'stock'
    ], {
      queryParams: {
        id: item.id
      }
    });

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


    const deleted =
      this.inventoryService.deleteItem(
        item.id
      );


    if (!deleted) {

      alert(
        'Unable to delete inventory item.'
      );

      return;

    }


    alert(
      'Inventory item deleted successfully.'
    );


    this.loadInventory();

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedStatus = 'All';

    this.selectedCategory = 'All';

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
    ).format(amount);

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


    return new Intl.DateTimeFormat(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    ).format(
      new Date(date)
    );

  }

}


