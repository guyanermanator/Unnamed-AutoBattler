import { AbilityData } from '@unnamed-auto-battler/shared';
import { Unit } from '../units/Unit';

/**
 * Runtime ability instance
 */
export class Ability {
  data: AbilityData;

  constructor(data: AbilityData) {
    this.data = data;
  }

  /**
   * Check if ability can be cast
   */
  canCast(caster: Unit): boolean {
    return caster.canCastAbility(this.data.manaCost);
  }

  /**
   * Cast the ability
   */
  cast(caster: Unit, target: Unit | null): void {
    if (!this.canCast(caster)) return;

    caster.stats.spendMana(this.data.manaCost);
    caster.startAbilityCooldown(this.data.cooldown);

    // Apply effects based on ability type
    if (this.data.damage && target) {
      const damage = this.data.damage.base + this.data.damage.scaling * caster.stats.magicDamage;
      target.stats.takeDamage(damage);
    }

    if (this.data.healing && target) {
      const healing = this.data.healing.base + this.data.healing.scaling * caster.stats.magicDamage;
      target.stats.heal(healing);
    }

    if (this.data.statusEffect && target) {
      // Apply status effect (implementation depends on StatusEffect system)
    }
  }
}
