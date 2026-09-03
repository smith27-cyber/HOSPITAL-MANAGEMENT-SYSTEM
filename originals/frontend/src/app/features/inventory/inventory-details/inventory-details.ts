
// =====================================================
// INVENTORY DETAILS COMPONENT
// File:
// src/app/features/inventory/inventory-details/inventory-details.ts
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
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  InventoryItem,
  InventoryStatus
} from '../../../shared/models/inventory.model';

import {
  InventoryService
} from '../../../core/services/inventory.service';


@Component({
  selector: 'app-inventory-details',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './inventory-details.html',

  styleUrl: './inventory-details.css'
})
export class InventoryDetails implements OnInit {


  // =====================================================
  // ITEM
  // =====================================================

  item: InventoryItem | undefined;


  // =====================================================
  // LOADING
  // =====================================================

  loading = false;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage = '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private inventoryService: InventoryService,

    private route: ActivatedRoute,

    private router: Router,

    private cdr: ChangeDetectorRef
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.route.paramMap.subscribe({

      next: params => {

        const id =
          params.get('id');

        if (!id) {

          this.router.navigate([
            '/inventory'
          ]);

          return;

        }

        this.loadItem(id);

      },

      error: error => {

        console.error(
          'Failed to read inventory route:',
          error
        );

        this.router.navigate([
          '/inventory'
        ]);

      }

    });

  }


  // =====================================================
  // LOAD ITEM
  // =====================================================

  private loadItem(
    id: string
  ): void {

    this.loading = true;

    this.errorMessage = '';

    this.item = undefined;


    this.cdr.detectChanges();


    this.inventoryService
      .getItemById(id)
      .subscribe({

        // -------------------------------------------------
        // SUCCESS
        // -------------------------------------------------

        next: (
          item: InventoryItem
        ) => {

          this.item = {
            ...item
          };

          this.loading = false;

          this.errorMessage = '';


          // Force immediate template refresh
          this.cdr.detectChanges();

        },


        // -------------------------------------------------
        // ERROR
        // -------------------------------------------------

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to load inventory item:',
            error
          );

          this.item = undefined;

          this.loading = false;

          this.errorMessage =
            'Inventory item could not be loaded.';


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // REFRESH
  // =====================================================

  refresh(): void {

    if (!this.item) {

      return;

    }


    this.loadItem(
      this.item.id
    );

  }


  // =====================================================
  // EDIT
  // =====================================================

  editItem(): void {

    if (!this.item) {

      return;

    }


    this.router.navigate([
      '/inventory',
      this.item.id,
      'edit'
    ]);

  }


  // =====================================================
  // MANAGE STOCK
  // =====================================================

  manageStock(): void {

    if (!this.item) {

      return;

    }


    this.router.navigate(
      [
        '/inventory',
        'stock'
      ],
      {
        queryParams: {
          id: this.item.id
        }
      }
    );

  }


  // =====================================================
  // BACK
  // =====================================================

  goBack(): void {

    this.router.navigate([
      '/inventory'
    ]);

  }


  // =====================================================
  // GET CURRENT STATUS
  // =====================================================

  getCurrentStatus(): InventoryStatus {

    if (!this.item) {

      return 'Out of Stock';

    }


    return this.inventoryService
      .calculateStatus(
        this.item
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
  // STOCK VALUE
  // =====================================================

  getStockValue(): number {

    if (!this.item) {

      return 0;

    }


    return (
      Number(this.item.quantity || 0) *
      Number(this.item.unitPrice || 0)
    );

  }


  // =====================================================
  // STOCK LEVEL
  // =====================================================

  getStockPercentage(): number {

    if (
      !this.item ||
      !this.item.maximumStock ||
      Number(this.item.maximumStock) <= 0
    ) {

      return 0;

    }


    const quantity =
      Number(
        this.item.quantity || 0
      );

    const maximumStock =
      Number(
        this.item.maximumStock
      );


    return Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (
            quantity /
            maximumStock
          ) * 100
        )
      )
    );

  }


  // =====================================================
  // STOCK LEVEL CLASS
  // =====================================================

  getStockLevelClass(): string {

    const percentage =
      this.getStockPercentage();


    if (percentage <= 25) {

      return 'stock-critical';

    }


    if (percentage <= 50) {

      return 'stock-low';

    }


    if (percentage <= 75) {

      return 'stock-medium';

    }


    return 'stock-good';

  }


  // =====================================================
  // CHECK IF EXPIRED
  // =====================================================

  isExpired(): boolean {

    return (
      this.getCurrentStatus() ===
      'Expired'
    );

  }


  // =====================================================
  // CHECK IF LOW STOCK
  // =====================================================

  isLowStock(): boolean {

    return (
      this.getCurrentStatus() ===
      'Low Stock'
    );

  }


  // =====================================================
  // CHECK IF OUT OF STOCK
  // =====================================================

  isOutOfStock(): boolean {

    return (
      this.getCurrentStatus() ===
      'Out of Stock'
    );

  }

}

