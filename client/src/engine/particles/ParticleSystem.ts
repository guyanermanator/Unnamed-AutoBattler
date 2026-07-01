import { Vector2 } from '../math/Vector2';
import { RNG } from '../rng/RNG';

export interface Particle {
  position: Vector2;
  velocity: Vector2;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

/**
 * Simple particle system
 */
export class ParticleSystem {
  private particles: Particle[] = [];
  private rng: RNG;

  constructor(rng: RNG) {
    this.rng = rng;
  }

  /**
   * Spawn particles
   */
  spawn(position: Vector2, count: number, options?: {
    velocity?: Vector2;
    spread?: number;
    life?: number;
    color?: string;
    size?: number;
  }): void {
    for (let i = 0; i < count; i++) {
      const angle = this.rng.nextFloat(0, Math.PI * 2);
      const speed = this.rng.nextFloat(10, 50);
      const velocity = Vector2.fromAngle(angle, speed);

      if (options?.velocity) {
        velocity.add(options.velocity);
      }

      this.particles.push({
        position: position.clone(),
        velocity,
        life: options?.life || 1,
        maxLife: options?.life || 1,
        color: options?.color || '#ffffff',
        size: options?.size || 2,
      });
    }
  }

  /**
   * Update particles
   */
  update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.position.add(Vector2.fromAngle(
        particle.velocity.angle(),
        particle.velocity.length() * dt
      ));
      particle.life -= dt;

      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Render particles
   */
  render(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.fillRect(
        particle.position.x - particle.size / 2,
        particle.position.y - particle.size / 2,
        particle.size,
        particle.size
      );
    });
    ctx.globalAlpha = 1;
  }

  /**
   * Clear all particles
   */
  clear(): void {
    this.particles = [];
  }
}
