/**
 * Trait system for unit modifiers
 */
export interface Trait {
  id: string;
  name: string;
  description: string;
  bonuses: {
    health?: number;
    attackDamage?: number;
    armor?: number;
    attackSpeed?: number;
  };
}

/** Minimal mutable stats interface used for trait application */
export interface MutableStats {
  maxHealth: number;
  attackDamage: number;
  armor: number;
  attackSpeed: number;
}

export class TraitSystem {
  private traits: Map<string, Trait> = new Map();

  /**
   * Register a trait
   */
  register(trait: Trait): void {
    this.traits.set(trait.id, trait);
  }

  /**
   * Get a trait
   */
  get(traitId: string): Trait | undefined {
    return this.traits.get(traitId);
  }

  /**
   * Apply trait bonuses to stats
   */
  applyTraits(stats: MutableStats, traitIds: string[]): void {
    traitIds.forEach(traitId => {
      const trait = this.traits.get(traitId);
      if (trait) {
        if (trait.bonuses.health) stats.maxHealth += trait.bonuses.health;
        if (trait.bonuses.attackDamage) stats.attackDamage += trait.bonuses.attackDamage;
        if (trait.bonuses.armor) stats.armor += trait.bonuses.armor;
        if (trait.bonuses.attackSpeed) stats.attackSpeed += trait.bonuses.attackSpeed;
      }
    });
  }
}
