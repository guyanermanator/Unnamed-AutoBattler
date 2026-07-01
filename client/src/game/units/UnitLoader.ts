import { UnitData } from '@unnamed-auto-battler/shared';
import { AssetManager } from '../../engine/assets/AssetManager';

/**
 * Loads unit data from JSON files
 */
export class UnitLoader {
  private assetManager: AssetManager;
  private units: Map<string, UnitData> = new Map();

  constructor(assetManager: AssetManager) {
    this.assetManager = assetManager;
  }

  /**
   * Load a unit by ID
   */
  async load(unitId: string): Promise<UnitData> {
    if (this.units.has(unitId)) {
      return this.units.get(unitId)!;
    }

    const path = `/assets/json/units/${unitId}.json`;
    const data = await this.assetManager.loadJSON<UnitData>(path);
    this.units.set(unitId, data);
    return data;
  }

  /**
   * Get cached unit data
   */
  get(unitId: string): UnitData | undefined {
    return this.units.get(unitId);
  }

  /**
   * Load multiple units
   */
  async loadMultiple(unitIds: string[]): Promise<UnitData[]> {
    return Promise.all(unitIds.map(id => this.load(id)));
  }
}
