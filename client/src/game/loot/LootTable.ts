import { RNG } from '../../engine/rng/RNG';

export interface LootEntry {
  itemId: string;
  weight: number;
  minQuantity?: number;
  maxQuantity?: number;
}

export interface LootTableData {
  id: string;
  entries: LootEntry[];
  rolls: number;
}

/**
 * Loot table for generating random rewards
 */
export class LootTable {
  private data: LootTableData;
  private rng: RNG;

  constructor(data: LootTableData, rng: RNG) {
    this.data = data;
    this.rng = rng;
  }

  /**
   * Roll for loot
   */
  roll(): Array<{ itemId: string; quantity: number }> {
    const results: Array<{ itemId: string; quantity: number }> = [];

    for (let i = 0; i < this.data.rolls; i++) {
      const entry = this.rollEntry();
      if (entry) {
        const quantity = this.rng.nextInt(
          entry.minQuantity || 1,
          entry.maxQuantity || 1
        );
        results.push({ itemId: entry.itemId, quantity });
      }
    }

    return results;
  }

  /**
   * Roll for a single entry
   */
  private rollEntry(): LootEntry | null {
    const totalWeight = this.data.entries.reduce((sum, e) => sum + e.weight, 0);
    let random = this.rng.nextFloat(0, totalWeight);

    for (const entry of this.data.entries) {
      random -= entry.weight;
      if (random <= 0) {
        return entry;
      }
    }

    return null;
  }
}
