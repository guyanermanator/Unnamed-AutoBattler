import { AbilityData } from '@unnamed-auto-battler/shared';
import { AssetManager } from '../../engine/assets/AssetManager';
import { Ability } from './Ability';

/**
 * Manages abilities and their execution
 */
export class AbilitySystem {
  private assetManager: AssetManager;
  private abilities: Map<string, AbilityData> = new Map();

  constructor(assetManager: AssetManager) {
    this.assetManager = assetManager;
  }

  /**
   * Load an ability
   */
  async load(abilityId: string): Promise<AbilityData> {
    if (this.abilities.has(abilityId)) {
      return this.abilities.get(abilityId)!;
    }

    const path = `/assets/json/abilities/${abilityId}.json`;
    const data = await this.assetManager.loadJSON<AbilityData>(path);
    this.abilities.set(abilityId, data);
    return data;
  }

  /**
   * Create ability instance
   */
  create(abilityId: string): Ability | null {
    const data = this.abilities.get(abilityId);
    if (!data) return null;
    return new Ability(data);
  }
}
