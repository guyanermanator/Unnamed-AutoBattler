import { Item } from '../items/Item';

const MAX_INVENTORY_SIZE = 30;

/**
 * Player inventory system
 */
export class Inventory {
  private items: Item[] = [];
  private maxSize: number;

  constructor(maxSize: number = MAX_INVENTORY_SIZE) {
    this.maxSize = maxSize;
  }

  /**
   * Add an item to inventory
   */
  addItem(item: Item): boolean {
    // Try to stack with existing item
    if (item.isStackable()) {
      const existing = this.items.find(i => i.data.id === item.data.id);
      if (existing) {
        existing.quantity += item.quantity;
        return true;
      }
    }

    // Add as new item if space available
    if (this.items.length < this.maxSize) {
      this.items.push(item);
      return true;
    }

    return false;
  }

  /**
   * Remove an item from inventory
   */
  removeItem(itemId: string, quantity: number = 1): boolean {
    const item = this.items.find(i => i.data.id === itemId);
    if (!item) return false;

    item.quantity -= quantity;
    if (item.quantity <= 0) {
      const index = this.items.indexOf(item);
      this.items.splice(index, 1);
    }

    return true;
  }

  /**
   * Get item by ID
   */
  getItem(itemId: string): Item | undefined {
    return this.items.find(i => i.data.id === itemId);
  }

  /**
   * Get all items
   */
  getItems(): Item[] {
    return [...this.items];
  }

  /**
   * Check if inventory has space
   */
  hasSpace(): boolean {
    return this.items.length < this.maxSize;
  }

  /**
   * Get inventory size
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Clear inventory
   */
  clear(): void {
    this.items = [];
  }
}
