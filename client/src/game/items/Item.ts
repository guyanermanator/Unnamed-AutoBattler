import { ItemData } from '@unnamed-auto-battler/shared';

/**
 * Runtime item instance
 */
export class Item {
  data: ItemData;
  quantity: number;

  constructor(data: ItemData, quantity: number = 1) {
    this.data = data;
    this.quantity = quantity;
  }

  /**
   * Check if item is stackable
   */
  isStackable(): boolean {
    return this.data.maxStack !== undefined && this.data.maxStack > 1;
  }

  /**
   * Check if item is consumable
   */
  isConsumable(): boolean {
    return this.data.consumable !== undefined;
  }

  /**
   * Use/consume the item
   */
  use(): boolean {
    if (!this.isConsumable()) return false;
    if (this.quantity > 0) {
      this.quantity--;
      return true;
    }
    return false;
  }
}
