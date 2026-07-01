import { Unit } from '../units/Unit';
import { RNG } from '../../engine/rng/RNG';
import { Battlefield } from './Battlefield';
import { Projectile } from './Projectile';
import { DamageFormulas } from './DamageFormulas';
import { eventBus } from '../../engine/events/EventBus';

/**
 * Combat simulator - ISOLATED FROM RENDERING
 * Fixed timestep simulation of combat between two teams
 */
export class CombatSimulator {
  private allies: Unit[] = [];
  private enemies: Unit[] = [];
  private projectiles: Projectile[] = [];
  private battlefield: Battlefield;
  private rng: RNG;
  private timeElapsed: number = 0;
  private maxDuration: number = 120; // 2 minutes max
  gameSpeed: number = 1.0;

  constructor(seed: number) {
    this.rng = new RNG(seed);
    this.battlefield = new Battlefield();
  }

  /**
   * Initialize combat with two teams
   */
  initialize(allies: Unit[], enemies: Unit[]): void {
    this.allies = allies;
    this.enemies = enemies;
    this.projectiles = [];
    this.timeElapsed = 0;

    // Position units
    allies.forEach((unit) => {
      unit.transform.position = this.battlefield.getRandomSpawnPosition('left');
    });

    enemies.forEach((unit) => {
      unit.transform.position = this.battlefield.getRandomSpawnPosition('right');
    });

    eventBus.emit('BattleStarted', { seed: this.rng.getSeed() });
  }

  /**
   * Update combat simulation
   */
  update(dt: number): boolean {
    const adjustedDt = dt * this.gameSpeed;
    this.timeElapsed += adjustedDt;

    // Check win/loss conditions
    const alliesAlive = this.allies.filter(u => u.stats.isAlive()).length;
    const enemiesAlive = this.enemies.filter(u => u.stats.isAlive()).length;

    if (alliesAlive === 0 || enemiesAlive === 0 || this.timeElapsed >= this.maxDuration) {
      const won = alliesAlive > 0;
      eventBus.emit('BattleFinished', { won, duration: this.timeElapsed });
      return true;
    }

    // Update units
    [...this.allies, ...this.enemies].forEach(unit => {
      if (!unit.stats.isAlive()) return;

      unit.update(adjustedDt);

      // Find target
      if (!unit.target || !unit.target.stats.isAlive()) {
        unit.target = this.findTarget(unit);
      }

      // Combat logic
      if (unit.target) {
        if (unit.isInRangeOf(unit.target)) {
          // In range - attack
          if (unit.canAttack()) {
            this.performAttack(unit, unit.target);
          }
        } else {
          // Move towards target
          const direction = unit.target.transform.position.clone()
            .subtract(unit.transform.position)
            .normalize();
          unit.transform.position.add(
            direction.clone().multiply(unit.stats.movementSpeed * adjustedDt)
          );
        }
      }
    });

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.update(adjustedDt);
      if (!projectile.active) {
        this.projectiles.splice(i, 1);
      }
    }

    return false;
  }

  /**
   * Find target for unit
   */
  private findTarget(unit: Unit): Unit | null {
    const enemies = unit.team === 'ally' ? this.enemies : this.allies;
    const aliveEnemies = enemies.filter(e => e.stats.isAlive());

    if (aliveEnemies.length === 0) return null;

    // Simple targeting: closest enemy
    let closest: Unit | null = null;
    let closestDist = Infinity;

    aliveEnemies.forEach(enemy => {
      const dist = unit.distanceTo(enemy);
      if (dist < closestDist) {
        closestDist = dist;
        closest = enemy;
      }
    });

    return closest;
  }

  /**
   * Perform an attack
   */
  private performAttack(attacker: Unit, target: Unit): void {
    attacker.startAttackCooldown();

    const isCrit = DamageFormulas.isCriticalHit(attacker.stats.critChance, () => this.rng.next());
    const damage = DamageFormulas.calculatePhysicalDamage(
      attacker.stats.attackDamage,
      target.stats.armor,
      isCrit,
      attacker.stats.critDamage
    );

    // Create projectile if ranged
    if (attacker.stats.attackRange > 1.5) {
      const projectile = new Projectile(attacker, target, damage, attacker.data.projectileSpeed || 200);
      projectile.onHit = (t) => {
        const actualDamage = t.stats.takeDamage(damage);
        attacker.stats.gainMana(DamageFormulas.calculateManaGain(actualDamage));
        t.stats.gainMana(DamageFormulas.calculateManaGainFromDamage(actualDamage));

        if (!t.stats.isAlive()) {
          eventBus.emit('UnitDied', { unitId: t.id, killedBy: attacker.id });
        }
      };
      this.projectiles.push(projectile);
    } else {
      // Melee - instant damage
      const actualDamage = target.stats.takeDamage(damage);
      attacker.stats.gainMana(DamageFormulas.calculateManaGain(actualDamage));
      target.stats.gainMana(DamageFormulas.calculateManaGainFromDamage(actualDamage));

      if (!target.stats.isAlive()) {
        eventBus.emit('UnitDied', { unitId: target.id, killedBy: attacker.id });
      }
    }
  }

  /**
   * Get all units
   */
  getAllUnits(): Unit[] {
    return [...this.allies, ...this.enemies];
  }

  /**
   * Get all projectiles
   */
  getProjectiles(): Projectile[] {
    return this.projectiles;
  }
}
