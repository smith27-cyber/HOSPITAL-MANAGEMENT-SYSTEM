import { Injectable } from '@angular/core';

import {
  InventoryItem,
  InventoryStatus,
  InventoryCategory,
  StockMovement,
  StockMovementType
} from '../../shared/models/inventory.model';


@Injectable({
  providedIn: 'root'
})
export class InventoryService {


  // =====================================================
  // STORAGE KEYS
  // =====================================================

  private readonly itemsStorageKey =
    'hms_inventory_items';

  private readonly movementsStorageKey =
    'hms_inventory_movements';


  // =====================================================
  // DATA
  // =====================================================

  private items: InventoryItem[] = [];

  private movements: StockMovement[] = [];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor() {

    this.loadItems();

    this.loadMovements();

  }


  // =====================================================
  // GET ALL ITEMS
  // =====================================================

  getItems(): InventoryItem[] {

    return [
      ...this.items
    ];

  }


  // =====================================================
  // GET ITEM BY ID
  // =====================================================

  getItemById(
    id: string
  ): InventoryItem | undefined {

    return this.items.find(
      item =>
        item.id === id
    );

  }


  // =====================================================
  // GET ITEMS BY CATEGORY
  // =====================================================

  getItemsByCategory(
    category: InventoryCategory
  ): InventoryItem[] {

    return this.items.filter(
      item =>
        item.category === category
    );

  }


  // =====================================================
  // GET MEDICINES
  // =====================================================

  getMedicines(): InventoryItem[] {

    return this.getItemsByCategory(
      'Medicine'
    );

  }


  // =====================================================
  // GET MEDICAL SUPPLIES
  // =====================================================

  getMedicalSupplies(): InventoryItem[] {

    return this.getItemsByCategory(
      'Medical Supplies'
    );

  }


  // =====================================================
  // GET LABORATORY SUPPLIES
  // =====================================================

  getLaboratorySupplies(): InventoryItem[] {

    return this.getItemsByCategory(
      'Laboratory Supplies'
    );

  }


  // =====================================================
  // GET EQUIPMENT
  // =====================================================

  getEquipment(): InventoryItem[] {

    return this.getItemsByCategory(
      'Equipment'
    );

  }


  // =====================================================
  // GET CONSUMABLES
  // =====================================================

  getConsumables(): InventoryItem[] {

    return this.getItemsByCategory(
      'Consumables'
    );

  }


  // =====================================================
  // GET OTHER ITEMS
  // =====================================================

  getOtherItems(): InventoryItem[] {

    return this.getItemsByCategory(
      'Other'
    );

  }


  // =====================================================
  // GET AVAILABLE ITEMS
  // =====================================================

  getAvailableItems(): InventoryItem[] {

    return this.items.filter(
      item =>
        item.quantity > 0 &&
        item.status !== 'Expired' &&
        item.status !== 'Discontinued'
    );

  }


  // =====================================================
  // GET AVAILABLE ITEMS BY CATEGORY
  // =====================================================

  getAvailableItemsByCategory(
    category: InventoryCategory
  ): InventoryItem[] {

    return this.getAvailableItems().filter(
      item =>
        item.category === category
    );

  }


  // =====================================================
  // GET LOW STOCK
  // =====================================================

  getLowStockItems(): InventoryItem[] {

    return this.items.filter(
      item =>
        item.status === 'Low Stock'
    );

  }


  // =====================================================
  // GET OUT OF STOCK
  // =====================================================

  getOutOfStockItems(): InventoryItem[] {

    return this.items.filter(
      item =>
        item.status === 'Out of Stock'
    );

  }


  // =====================================================
  // GET EXPIRED
  // =====================================================

  getExpiredItems(): InventoryItem[] {

    return this.items.filter(
      item =>
        item.status === 'Expired'
    );

  }


  // =====================================================
  // GET EXPIRING SOON
  // =====================================================

  getExpiringSoonItems(
    days = 30
  ): InventoryItem[] {

    const today =
      new Date();


    today.setHours(
      0,
      0,
      0,
      0
    );


    const futureDate =
      new Date(today);


    futureDate.setDate(
      futureDate.getDate() + days
    );


    return this.items.filter(
      item => {

        if (!item.expiryDate) {

          return false;

        }


        const expiry =
          new Date(
            item.expiryDate
          );


        expiry.setHours(
          0,
          0,
          0,
          0
        );


        return (
          expiry >= today &&
          expiry <= futureDate
        );

      }
    );

  }


  // =====================================================
  // GET CATEGORY COUNT
  // =====================================================

  getCategoryCount(
    category: InventoryCategory
  ): number {

    return this.items.filter(
      item =>
        item.category === category
    ).length;

  }


  // =====================================================
  // GET TOTAL ITEMS
  // =====================================================

  getTotalItems(): number {

    return this.items.length;

  }


  // =====================================================
  // GET TOTAL STOCK QUANTITY
  // =====================================================

  getTotalQuantity(): number {

    return this.items.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

  }


  // =====================================================
  // GET TOTAL STOCK VALUE
  // =====================================================

  getTotalStockValue(): number {

    return this.items.reduce(
      (total, item) =>
        total +
        (
          item.quantity *
          item.unitPrice
        ),
      0
    );

  }


  // =====================================================
  // ADD ITEM
  // =====================================================

  addItem(
    item: InventoryItem
  ): void {

    const newItem: InventoryItem = {

      ...item,

      status:
        this.calculateStatus(
          item.quantity,
          item.minimumStock,
          item.expiryDate
        )

    };


    this.items.push(
      newItem
    );


    this.saveItems();

  }


  // =====================================================
  // UPDATE ITEM
  // =====================================================

  updateItem(
    updatedItem: InventoryItem
  ): boolean {

    const index =
      this.items.findIndex(
        item =>
          item.id === updatedItem.id
      );


    if (index === -1) {

      return false;

    }


    this.items[index] = {

      ...updatedItem,

      status:
        this.calculateStatus(
          updatedItem.quantity,
          updatedItem.minimumStock,
          updatedItem.expiryDate
        ),

      updatedAt:
        new Date().toISOString()

    };


    this.saveItems();


    return true;

  }


  // =====================================================
  // DELETE ITEM
  // =====================================================

  deleteItem(
    id: string
  ): boolean {

    const originalLength =
      this.items.length;


    this.items =
      this.items.filter(
        item =>
          item.id !== id
      );


    if (
      this.items.length ===
      originalLength
    ) {

      return false;

    }


    this.saveItems();


    return true;

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
  ): boolean {

    if (quantity <= 0) {

      return false;

    }


    const item =
      this.getItemById(itemId);


    if (!item) {

      return false;

    }


    const previousQuantity =
      item.quantity;


    item.quantity += quantity;


    item.status =
      this.calculateStatus(
        item.quantity,
        item.minimumStock,
        item.expiryDate
      );


    item.updatedAt =
      new Date().toISOString();


    this.createMovement({

      itemId: item.id,

      itemName: item.itemName,

      type: 'Stock In',

      quantity,

      previousQuantity,

      newQuantity: item.quantity,

      reason,

      reference,

      performedBy

    });


    this.saveItems();


    return true;

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
  ): boolean {

    if (quantity <= 0) {

      return false;

    }


    const item =
      this.getItemById(itemId);


    if (!item) {

      return false;

    }


    if (
      quantity >
      item.quantity
    ) {

      return false;

    }


    const previousQuantity =
      item.quantity;


    item.quantity -= quantity;


    item.status =
      this.calculateStatus(
        item.quantity,
        item.minimumStock,
        item.expiryDate
      );


    item.updatedAt =
      new Date().toISOString();


    this.createMovement({

      itemId: item.id,

      itemName: item.itemName,

      type: 'Stock Out',

      quantity,

      previousQuantity,

      newQuantity: item.quantity,

      reason,

      reference,

      performedBy

    });


    this.saveItems();


    return true;

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
  ): boolean {

    if (newQuantity < 0) {

      return false;

    }


    const item =
      this.getItemById(itemId);


    if (!item) {

      return false;

    }


    const previousQuantity =
      item.quantity;


    item.quantity =
      newQuantity;


    item.status =
      this.calculateStatus(
        item.quantity,
        item.minimumStock,
        item.expiryDate
      );


    item.updatedAt =
      new Date().toISOString();


    this.createMovement({

      itemId: item.id,

      itemName: item.itemName,

      type: 'Adjustment',

      quantity:
        Math.abs(
          newQuantity -
          previousQuantity
        ),

      previousQuantity,

      newQuantity,

      reason,

      reference,

      performedBy

    });


    this.saveItems();


    return true;

  }


  // =====================================================
  // GET MOVEMENTS
  // =====================================================

  getMovements(): StockMovement[] {

    return [
      ...this.movements
    ];

  }


  // =====================================================
  // GET ITEM MOVEMENTS
  // =====================================================

  getMovementsByItem(
    itemId: string
  ): StockMovement[] {

    return this.movements.filter(
      movement =>
        movement.itemId === itemId
    );

  }


  // =====================================================
  // GENERATE ITEM ID
  // =====================================================

  generateItemId(): string {

    return (
      'INV-' +
      Date.now().toString()
    );

  }


  // =====================================================
  // GENERATE MOVEMENT ID
  // =====================================================

  private generateMovementId(): string {

    return (
      'MOV-' +
      Date.now().toString() +
      '-' +
      Math.floor(
        Math.random() * 1000
      )
    );

  }


  // =====================================================
  // CALCULATE STATUS
  // =====================================================

  private calculateStatus(
    quantity: number,
    minimumStock: number,
    expiryDate?: string
  ): InventoryStatus {

    if (expiryDate) {

      const expiry =
        new Date(expiryDate);

      const today =
        new Date();


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


    if (quantity <= 0) {

      return 'Out of Stock';

    }


    if (
      quantity <= minimumStock
    ) {

      return 'Low Stock';

    }


    return 'In Stock';

  }


  // =====================================================
  // CREATE MOVEMENT
  // =====================================================

  private createMovement(
    data: {
      itemId: string;
      itemName: string;
      type: StockMovementType;
      quantity: number;
      previousQuantity: number;
      newQuantity: number;
      reason?: string;
      reference?: string;
      performedBy?: string;
    }
  ): void {

    const movement: StockMovement = {

      id:
        this.generateMovementId(),

      itemId:
        data.itemId,

      itemName:
        data.itemName,

      type:
        data.type,

      quantity:
        data.quantity,

      previousQuantity:
        data.previousQuantity,

      newQuantity:
        data.newQuantity,

      reason:
        data.reason,

      reference:
        data.reference,

      performedBy:
        data.performedBy,

      movementDate:
        new Date().toISOString(),

      createdAt:
        new Date().toISOString()

    };


    this.movements.push(
      movement
    );


    this.saveMovements();

  }


  // =====================================================
  // SAVE ITEMS
  // =====================================================

  private saveItems(): void {

    localStorage.setItem(
      this.itemsStorageKey,
      JSON.stringify(
        this.items
      )
    );

  }


  // =====================================================
  // SAVE MOVEMENTS
  // =====================================================

  private saveMovements(): void {

    localStorage.setItem(
      this.movementsStorageKey,
      JSON.stringify(
        this.movements
      )
    );

  }


  // =====================================================
  // LOAD ITEMS
  // =====================================================

  private loadItems(): void {

    const stored =
      localStorage.getItem(
        this.itemsStorageKey
      );


    if (!stored) {

      this.items = [];

      return;

    }


    try {

      const parsed =
        JSON.parse(stored);


      if (
        Array.isArray(parsed)
      ) {

        this.items =
          parsed.map(
            (item: InventoryItem) => ({

              ...item,

              quantity:
                item.quantity ?? 0,

              minimumStock:
                item.minimumStock ?? 0,

              unitPrice:
                item.unitPrice ?? 0,

              status:
                this.calculateStatus(
                  item.quantity ?? 0,
                  item.minimumStock ?? 0,
                  item.expiryDate
                )

            })
          );

      } else {

        this.items = [];

      }

    } catch (error) {

      console.error(
        'Failed to load inventory items:',
        error
      );

      this.items = [];

    }

  }


  // =====================================================
  // LOAD MOVEMENTS
  // =====================================================

  private loadMovements(): void {

    const stored =
      localStorage.getItem(
        this.movementsStorageKey
      );


    if (!stored) {

      this.movements = [];

      return;

    }


    try {

      const parsed =
        JSON.parse(stored);


      if (
        Array.isArray(parsed)
      ) {

        this.movements =
          parsed;

      } else {

        this.movements = [];

      }

    } catch (error) {

      console.error(
        'Failed to load inventory movements:',
        error
      );

      this.movements = [];

    }

  }

}
