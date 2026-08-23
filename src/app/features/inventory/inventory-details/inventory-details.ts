import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

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

    this.item =
      this.inventoryService.getItemById(id);

    if (!this.item) {

      alert(
        'Inventory item not found.'
      );

      this.router.navigate([
        '/inventory'
      ]);

    }

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
  // BACK
  // =====================================================

  goBack(): void {

    this.router.navigate([
      '/inventory'
    ]);

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
  // STOCK VALUE
  // =====================================================

  getStockValue(): number {

    if (!this.item) {
      return 0;
    }

    return (
      this.item.quantity *
      this.item.unitPrice
    );

  }


  // =====================================================
  // STOCK LEVEL
  // =====================================================

  getStockPercentage(): number {

    if (
      !this.item ||
      !this.item.maximumStock ||
      this.item.maximumStock <= 0
    ) {

      return 0;

    }

    return Math.min(
      100,
      Math.round(
        (
          this.item.quantity /
          this.item.maximumStock
        ) * 100
      )
    );

  }

}
