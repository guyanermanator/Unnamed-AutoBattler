import { UnitStats as SharedUnitStats } from '@unnamed-auto-battler/shared';

/**
 * Runtime unit stats (includes current health/mana)
 */
export class UnitStats implements SharedUnitStats {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  manaRegen: number;
  attackDamage: number;
  magicDamage: number;
  armor: number;
  magicResist: number;
  attackSpeed: number;
  attackRange: number;
  critChance: number;
  critDamage: number;
  movementSpeed: number;

  constructor(stats: SharedUnitStats) {
    this.health = stats.health;
    this.maxHealth = stats.maxHealth;
    this.mana = stats.mana;
    this.maxMana = stats.maxMana;
    this.manaRegen = stats.manaRegen;
    this.attackDamage = stats.attackDamage;
    this.magicDamage = stats.magicDamage;
    this.armor = stats.armor;
    this.magicResist = stats.magicResist;
    this.attackSpeed = stats.attackSpeed;
    this.attackRange = stats.attackRange;
    this.critChance = stats.critChance;
    this.critDamage = stats.critDamage || 2.0;
    this.movementSpeed = stats.movementSpeed;
  }

  /**
   * Clone stats
   */
  clone(): UnitStats {
    return new UnitStats(this);
  }

  /**
   * Check if unit is alive
   */
  isAlive(): boolean {
    return this.health > 0;
  }

  /**
   * Take damage
   */
  takeDamage(amount: number): number {
    const actualDamage = Math.min(amount, this.health);
    this.health -= actualDamage;
    return actualDamage;
  }

  /**
   * Heal
   */
  heal(amount: number): number {
    const actualHealing = Math.min(amount, this.maxHealth - this.health);
    this.health += actualHealing;
    return actualHealing;
  }

  /**
   * Gain mana
   */
  gainMana(amount: number): number {
    const actualGain = Math.min(amount, this.maxMana - this.mana);
    this.mana += actualGain;
    return actualGain;
  }

  /**
   * Spend mana
   */
  spendMana(amount: number): boolean {
    if (this.mana >= amount) {
      this.mana -= amount;
      return true;
    }
    return false;
  }
}
