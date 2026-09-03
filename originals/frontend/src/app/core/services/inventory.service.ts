// =====================================================
// INVENTORY SERVICE
// File:
// src/app/core/services/inventory.service.ts
// =====================================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  map,
  switchMap
} from 'rxjs';

import {
  InventoryItem,
  InventoryStatus
} from '../../shared/models/inventory.model';


@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  // =====================================================
  // API URL
  // =====================================================

  private readonly API_URL =
    'http://localhost:8081/api/inventory';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private http: HttpClient
  ) {}


  // =====================================================
  // GET ALL ITEMS
  // =====================================================

  getItems(): Observable<InventoryItem[]> {

    return this.http.get<InventoryItem[]>(
      this.API_URL
    );

  }


  // =====================================================
  // GET ITEM BY ID
  // =====================================================

  getItemById(
    id: string
  ): Observable<InventoryItem> {

    return this.http.get<InventoryItem>(
      `${this.API_URL}/${id}`
    );

  }


  // =====================================================
  // ADD ITEM
  // =====================================================

  addItem(
    item: InventoryItem
  ): Observable<InventoryItem> {

    return this.http.post<InventoryItem>(
      this.API_URL,
      item
    );

  }


  // =====================================================
  // UPDATE ITEM
  // =====================================================

  updateItem(
    id: string,
    item: InventoryItem
  ): Observable<InventoryItem> {

    return this.http.put<InventoryItem>(
      `${this.API_URL}/${id}`,
      item
    );

  }


  // =====================================================
  // DELETE ITEM
  // =====================================================

  deleteItem(
    id: string
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.API_URL}/${id}`
    );

  }


  // =====================================================
  // UPDATE STATUS
  // =====================================================

  updateItemStatus(
    id: string,
    status: InventoryStatus
  ): Observable<InventoryItem> {

    return this.http.patch<InventoryItem>(
      `${this.API_URL}/${id}/status`,
      null,
      {
        params: {
          status: status
        }
      }
    );

  }


  // =====================================================
  // UPDATE QUANTITY
  // =====================================================

  updateQuantity(
    id: string,
    quantity: number
  ): Observable<InventoryItem> {

    return this.http.patch<InventoryItem>(
      `${this.API_URL}/${id}/quantity`,
      null,
      {
        params: {
          quantity: quantity.toString()
        }
      }
    );

  }


  // =====================================================
  // SEARCH ITEMS
  // =====================================================

  searchItems(
    searchTerm: string
  ): Observable<InventoryItem[]> {

    return this.http.get<InventoryItem[]>(
      `${this.API_URL}/search`,
      {
        params: {
          term: searchTerm
        }
      }
    );

  }


  // =====================================================
  // STOCK IN
  // =====================================================

  stockIn(
    itemId: string,
    quantity: number,
    reason?: string,
    reference?: string,
    performedBy?: string
  ): Observable<InventoryItem> {

    if (quantity <= 0) {

      throw new Error(
        'Stock-in quantity must be greater than zero.'
      );

    }

    return this.getItemById(itemId).pipe(

      switchMap(
        (item: InventoryItem) => {

          const currentQuantity =
            Number(item.quantity) || 0;

          const newQuantity =
            currentQuantity + quantity;

          return this.updateQuantity(
            itemId,
            newQuantity
          );

        }
      )

    );

  }


  // =====================================================
  // STOCK OUT
  // =====================================================

  stockOut(
    itemId: string,
    quantity: number,
    reason?: string,
    reference?: string,
    performedBy?: string
  ): Observable<InventoryItem> {

    if (quantity <= 0) {

      throw new Error(
        'Stock-out quantity must be greater than zero.'
      );

    }

    return this.getItemById(itemId).pipe(

      switchMap(
        (item: InventoryItem) => {

          const currentQuantity =
            Number(item.quantity) || 0;

          if (quantity > currentQuantity) {

            throw new Error(
              'Stock-out quantity cannot exceed available stock.'
            );

          }

          const newQuantity =
            currentQuantity - quantity;

          return this.updateQuantity(
            itemId,
            newQuantity
          );

        }
      )

    );

  }


  // =====================================================
  // STOCK ADJUSTMENT
  // =====================================================

  adjustStock(
    itemId: string,
    newQuantity: number,
    reason?: string,
    reference?: string,
    performedBy?: string
  ): Observable<InventoryItem> {

    if (newQuantity < 0) {

      throw new Error(
        'Stock quantity cannot be negative.'
      );

    }

    return this.updateQuantity(
      itemId,
      newQuantity
    );

  }


  // =====================================================
  // GET LOW STOCK ITEMS
  // =====================================================

  getLowStockItems(): Observable<InventoryItem[]> {

    return this.getItems().pipe(

      map(
        (items: InventoryItem[]) =>
          items.filter(
            (item: InventoryItem) =>
              item.status === 'Low Stock'
          )
      )

    );

  }


  // =====================================================
  // GET OUT OF STOCK ITEMS
  // =====================================================

  getOutOfStockItems(): Observable<InventoryItem[]> {

    return this.getItems().pipe(

      map(
        (items: InventoryItem[]) =>
          items.filter(
            (item: InventoryItem) =>
              item.status === 'Out of Stock'
          )
      )

    );

  }


  // =====================================================
  // GET EXPIRED ITEMS
  // =====================================================

  getExpiredItems(): Observable<InventoryItem[]> {

    return this.getItems().pipe(

      map(
        (items: InventoryItem[]) =>
          items.filter(
            (item: InventoryItem) =>
              item.status === 'Expired'
          )
      )

    );

  }


  // =====================================================
  // GET TOTAL ITEMS
  // =====================================================

  getTotalItems(): Observable<number> {

    return this.getItems().pipe(

      map(
        (items: InventoryItem[]) =>
          items.length
      )

    );

  }


  // =====================================================
  // GET TOTAL QUANTITY
  // =====================================================

  getTotalQuantity(): Observable<number> {

    return this.getItems().pipe(

      map(
        (items: InventoryItem[]) =>
          items.reduce(
            (
              total: number,
              item: InventoryItem
            ) =>
              total +
              Number(item.quantity || 0),
            0
          )
      )

    );

  }


  // =====================================================
  // GET TOTAL STOCK VALUE
  // =====================================================

  getTotalStockValue(): Observable<number> {

    return this.getItems().pipe(

      map(
        (items: InventoryItem[]) =>
          items.reduce(
            (
              total: number,
              item: InventoryItem
            ) =>
              total +
              (
                Number(item.quantity || 0) *
                Number(item.unitPrice || 0)
              ),
            0
          )
      )

    );

  }


  // =====================================================
  // CALCULATE STATUS
  // =====================================================

  calculateStatus(
    item: InventoryItem
  ): InventoryStatus {

    const quantity =
      Number(item.quantity) || 0;

    const minimumStock =
      Number(item.minimumStock) || 0;


    // ---------------------------------------------------
    // EXPIRED
    // ---------------------------------------------------

    if (item.expiryDate) {

      const expiry =
        new Date(item.expiryDate);

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

      if (expiry < today) {

        return 'Expired';

      }

    }


    // ---------------------------------------------------
    // OUT OF STOCK
    // ---------------------------------------------------

    if (quantity <= 0) {

      return 'Out of Stock';

    }


    // ---------------------------------------------------
    // LOW STOCK
    // ---------------------------------------------------

    if (quantity <= minimumStock) {

      return 'Low Stock';

    }


    // ---------------------------------------------------
    // IN STOCK
    // ---------------------------------------------------

    return 'In Stock';

  }

}
