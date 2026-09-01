
// =====================================================
// INVENTORY STATUS
// =====================================================

export type InventoryStatus =
  | 'In Stock'
  | 'Low Stock'
  | 'Out of Stock'
  | 'Expired'
  | 'Discontinued';


// =====================================================
// INVENTORY CATEGORY
// =====================================================

export type InventoryCategory =
  | 'Medicine'
  | 'Medical Supplies'
  | 'Laboratory Supplies'
  | 'Equipment'
  | 'Consumables'
  | 'Other';


// =====================================================
// INVENTORY UNIT
// =====================================================

export type InventoryUnit =
  | 'Piece'
  | 'Box'
  | 'Pack'
  | 'Bottle'
  | 'Vial'
  | 'Tablet'
  | 'Capsule'
  | 'Pair'
  | 'Set'
  | 'Roll'
  | 'Other';


// =====================================================
// INVENTORY ITEM
// =====================================================

export interface InventoryItem {

  id: string;

  itemName: string;

  itemCode: string;

  category: InventoryCategory;

  unit: InventoryUnit;

  description?: string;

  quantity: number;

  minimumStock: number;

  maximumStock?: number;

  unitPrice: number;

  supplier?: string;

  supplierContact?: string;

  batchNumber?: string;

  expiryDate?: string;

  storageLocation?: string;

  status: InventoryStatus;

  notes?: string;

  createdAt: string;

  updatedAt?: string;

}


// =====================================================
// STOCK MOVEMENT TYPE
// =====================================================

export type StockMovementType =
  | 'Stock In'
  | 'Stock Out'
  | 'Adjustment';


// =====================================================
// STOCK MOVEMENT
// =====================================================

export interface StockMovement {

  id: string;

  itemId: string;

  itemName: string;

  type: StockMovementType;

  quantity: number;

  previousQuantity: number;

  newQuantity: number;

  reason?: string;

  reference?: string;

  performedBy?: string;

  movementDate: string;

  createdAt: string;

}

