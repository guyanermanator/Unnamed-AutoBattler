import { ItemData } from '@unnamed-auto-battler/shared';
import { AssetManager } from '../../engine/assets/AssetManager';

/**
 * Loads item data from JSON files
 */
export class ItemLoader {
  private assetManager: AssetManager;
  private items: Map<string, ItemData> = new Map();

  constructor(assetManager: AssetManager) {
    this.assetManager = assetManager;
  }

  /**
   * Load an item by ID
   */
  async load(itemId: string): Promise<ItemData> {
    if (this.items.has(itemId)) {
      return this.items.get(itemId)!;
    }

    const path = `/assets/json/items/${itemId}.json`;
    const data = await this.assetManager.loadJSON<ItemData>(path);
    this.items.set(itemId, data);
    return data;
  }

  /**
   * Get cached item data
   */
  get(itemId: string): ItemData | undefined {
    return this.items.get(itemId);
  }

  /**
   * Load multiple items
   */
  async loadMultiple(itemIds: string[]): Promise<ItemData[]> {
    return Promise.all(itemIds.map(id => this.load(id)));
  }
}
