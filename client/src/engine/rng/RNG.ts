/**
 * Mulberry32 - A fast, high-quality PRNG
 * Never use Math.random() directly - always use this seeded RNG
 */
export class RNG {
  private state: number;
  private initialSeed: number;

  constructor(seed: number = Date.now()) {
    this.initialSeed = seed;
    this.state = seed;
  }

  /**
   * Get the current seed
   */
  getSeed(): number {
    return this.initialSeed;
  }

  /**
   * Get current state for saving
   */
  getState(): number {
    return this.state;
  }

  /**
   * Restore state from save
   */
  setState(state: number): void {
    this.state = state;
  }

  /**
   * Reset to initial seed
   */
  reset(): void {
    this.state = this.initialSeed;
  }

  /**
   * Generate next random number [0, 1)
   */
  next(): number {
    let t = this.state += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  /**
   * Generate random integer in range [min, max]
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Generate random float in range [min, max)
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Generate random boolean
   */
  nextBool(): boolean {
    return this.next() < 0.5;
  }

  /**
   * Pick random element from array
   */
  pick<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }

  /**
   * Shuffle array in place (Fisher-Yates)
   */
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Roll dice - returns sum of n dice with d sides
   */
  rollDice(n: number, d: number): number {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += this.nextInt(1, d);
    }
    return sum;
  }
}
