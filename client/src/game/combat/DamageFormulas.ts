// import { UnitStats } from '@unnamed-auto-battler/shared';

/**
 * Damage calculation formulas
 */
export class DamageFormulas {
  /**
   * Calculate physical damage
   */
  static calculatePhysicalDamage(
    attackDamage: number,
    armor: number,
    isCrit: boolean = false,
    critDamage: number = 2.0
  ): number {
    const armorReduction = armor / (armor + 100);
    const baseDamage = attackDamage * (1 - armorReduction);
    return isCrit ? baseDamage * critDamage : baseDamage;
  }

  /**
   * Calculate magical damage
   */
  static calculateMagicalDamage(
    magicDamage: number,
    magicResist: number
  ): number {
    const resistReduction = magicResist / (magicResist + 100);
    return magicDamage * (1 - resistReduction);
  }

  /**
   * Calculate true damage (ignores armor/resist)
   */
  static calculateTrueDamage(damage: number): number {
    return damage;
  }

  /**
   * Check if attack is a critical hit
   */
  static isCriticalHit(critChance: number, rng: () => number): boolean {
    return rng() < critChance;
  }

  /**
   * Calculate mana gain from damage dealt
   */
  static calculateManaGain(damage: number): number {
    return damage * 0.1;
  }

  /**
   * Calculate mana gain from damage taken
   */
  static calculateManaGainFromDamage(damage: number): number {
    return damage * 0.05;
  }

  /**
   * Calculate healing amount
   */
  static calculateHealing(baseHealing: number, scaling: number, stat: number): number {
    return baseHealing + scaling * stat;
  }

  /**
   * Calculate lifesteal healing
   */
  static calculateLifesteal(damage: number, lifestealPercent: number): number {
    return damage * lifestealPercent;
  }
}
