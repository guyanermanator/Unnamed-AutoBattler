/**
 * 2D Vector class for position, velocity, and direction calculations
 */
export class Vector2 {
  constructor(public x: number = 0, public y: number = 0) {}

  /**
   * Create a copy of this vector
   */
  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  /**
   * Set the x and y components
   */
  set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * Add another vector to this one
   */
  add(v: Vector2): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  /**
   * Subtract another vector from this one
   */
  subtract(v: Vector2): this {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  /**
   * Multiply this vector by a scalar
   */
  multiply(scalar: number): this {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  /**
   * Divide this vector by a scalar
   */
  divide(scalar: number): this {
    if (scalar !== 0) {
      this.x /= scalar;
      this.y /= scalar;
    }
    return this;
  }

  /**
   * Get the length (magnitude) of this vector
   */
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Get the squared length (avoids sqrt for performance)
   */
  lengthSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  /**
   * Normalize this vector (make length 1)
   */
  normalize(): this {
    const len = this.length();
    if (len > 0) {
      this.divide(len);
    }
    return this;
  }

  /**
   * Calculate distance to another vector
   */
  distanceTo(v: Vector2): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate squared distance to another vector
   */
  distanceToSquared(v: Vector2): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return dx * dx + dy * dy;
  }

  /**
   * Dot product with another vector
   */
  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  /**
   * Get the angle in radians
   */
  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  /**
   * Create a vector from an angle
   */
  static fromAngle(angle: number, length: number = 1): Vector2 {
    return new Vector2(Math.cos(angle) * length, Math.sin(angle) * length);
  }

  /**
   * Linear interpolation between two vectors
   */
  static lerp(a: Vector2, b: Vector2, t: number): Vector2 {
    return new Vector2(
      a.x + (b.x - a.x) * t,
      a.y + (b.y - a.y) * t
    );
  }

  /**
   * Zero vector constant
   */
  static get zero(): Vector2 {
    return new Vector2(0, 0);
  }

  /**
   * One vector constant
   */
  static get one(): Vector2 {
    return new Vector2(1, 1);
  }
}
