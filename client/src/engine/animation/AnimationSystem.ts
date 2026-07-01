/**
 * Simple animation system
 */
export interface Animation {
  frames: string[];
  frameTime: number;
  loop: boolean;
}

export class AnimationSystem {
  private animations: Map<string, Animation> = new Map();
  private currentAnimation: string | null = null;
  private currentFrame: number = 0;
  private elapsed: number = 0;
  private playing: boolean = false;

  /**
   * Register an animation
   */
  register(name: string, animation: Animation): void {
    this.animations.set(name, animation);
  }

  /**
   * Play an animation
   */
  play(name: string, reset: boolean = false): void {
    if (name === this.currentAnimation && !reset) return;

    const animation = this.animations.get(name);
    if (!animation) {
      console.error(`Animation "${name}" not found`);
      return;
    }

    this.currentAnimation = name;
    this.currentFrame = 0;
    this.elapsed = 0;
    this.playing = true;
  }

  /**
   * Stop current animation
   */
  stop(): void {
    this.playing = false;
  }

  /**
   * Update animation
   */
  update(dt: number): void {
    if (!this.playing || !this.currentAnimation) return;

    const animation = this.animations.get(this.currentAnimation);
    if (!animation) return;

    this.elapsed += dt;

    if (this.elapsed >= animation.frameTime) {
      this.elapsed -= animation.frameTime;
      this.currentFrame++;

      if (this.currentFrame >= animation.frames.length) {
        if (animation.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = animation.frames.length - 1;
          this.playing = false;
        }
      }
    }
  }

  /**
   * Get current frame
   */
  getCurrentFrame(): string | null {
    if (!this.currentAnimation) return null;

    const animation = this.animations.get(this.currentAnimation);
    if (!animation) return null;

    return animation.frames[this.currentFrame];
  }

  /**
   * Check if animation is playing
   */
  isPlaying(): boolean {
    return this.playing;
  }
}
