import { Vector2 } from '../../engine/math/Vector2';
import { Unit } from '../units/Unit';

/**
 * Projectile in combat
 */
export class Projectile {
  id: string;
  position: Vector2;
  target: Unit;
  source: Unit;
  speed: number;
  damage: number;
  onHit?: (target: Unit) => void;
  active: boolean = true;

  constructor(
    source: Unit,
    target: Unit,
    damage: number,
    speed: number = 200
  ) {
    this.id = `projectile_${Date.now()}_${Math.random()}`;
    this.source = source;
    this.target = target;
    this.damage = damage;
    this.speed = speed;
    this.position = source.transform.position.clone();
  }

  /**
   * Update projectile movement
   */
  update(dt: number): void {
    if (!this.active) return;

    // Move towards target
    const direction = this.target.transform.position.clone()
      .subtract(this.position)
      .normalize();

    this.position.add(
      new Vector2(direction.x * this.speed * dt, direction.y * this.speed * dt)
    );

    // Check if hit target
    if (this.position.distanceTo(this.target.transform.position) < 5) {
      this.hit();
    }
  }

  /**
   * Hit the target
   */
  private hit(): void {
    this.active = false;
    if (this.onHit) {
      this.onHit(this.target);
    }
  }
}
