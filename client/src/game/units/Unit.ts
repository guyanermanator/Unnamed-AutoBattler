import { UnitData } from '@unnamed-auto-battler/shared';
import { Vector2 } from '../../engine/math/Vector2';
import { Entity } from '../../engine/ecs/Entity';
import { UnitStats } from './UnitStats';
import { StatusEffect } from '../combat/StatusEffect';

/**
 * Runtime unit with combat state
 */
export class Unit extends Entity {
  data: UnitData;
  stats: UnitStats;
  target: Unit | null = null;
  statusEffects: StatusEffect[] = [];
  attackCooldown: number = 0;
  abilityCooldown: number = 0;
  team: 'ally' | 'enemy';

  constructor(data: UnitData, team: 'ally' | 'enemy', position: Vector2) {
    super(data.name);
    this.data = data;
    this.stats = new UnitStats(data.stats);
    this.team = team;
    this.transform.position = position;
  }

  /**
   * Update unit
   */
  update(dt: number): void {
    super.update(dt);

    // Update cooldowns
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }
    if (this.abilityCooldown > 0) {
      this.abilityCooldown -= dt;
    }

    // Update status effects
    for (let i = this.statusEffects.length - 1; i >= 0; i--) {
      const effect = this.statusEffects[i];
      effect.duration -= dt;
      if (effect.duration <= 0) {
        this.statusEffects.splice(i, 1);
      }
    }

    // Mana regen
    if (this.stats.manaRegen > 0) {
      this.stats.gainMana(this.stats.manaRegen * dt);
    }
  }

  /**
   * Check if can attack
   */
  canAttack(): boolean {
    return this.attackCooldown <= 0 && this.stats.isAlive();
  }

  /**
   * Check if can cast ability
   */
  canCastAbility(manaCost: number): boolean {
    return this.abilityCooldown <= 0 && this.stats.mana >= manaCost && this.stats.isAlive();
  }

  /**
   * Start attack cooldown
   */
  startAttackCooldown(): void {
    this.attackCooldown = 1 / this.stats.attackSpeed;
  }

  /**
   * Start ability cooldown
   */
  startAbilityCooldown(cooldown: number): void {
    this.abilityCooldown = cooldown;
  }

  /**
   * Add status effect
   */
  addStatusEffect(effect: StatusEffect): void {
    // Check if effect already exists
    const existing = this.statusEffects.find(e => e.id === effect.id);
    if (existing) {
      existing.duration = Math.max(existing.duration, effect.duration);
      existing.stacks = Math.min(existing.stacks + effect.stacks, 10);
    } else {
      this.statusEffects.push(effect);
    }
  }

  /**
   * Has status effect
   */
  hasStatusEffect(type: string): boolean {
    return this.statusEffects.some(e => e.type === type);
  }

  /**
   * Get distance to another unit
   */
  distanceTo(other: Unit): number {
    return this.transform.position.distanceTo(other.transform.position);
  }

  /**
   * Is in attack range of target
   */
  isInRangeOf(target: Unit): boolean {
    return this.distanceTo(target) <= this.stats.attackRange;
  }
}
