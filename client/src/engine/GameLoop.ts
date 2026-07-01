/**
 * Fixed timestep game loop with interpolation
 */
export class GameLoop {
  private running: boolean = false;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly fixedDt: number;
  private readonly maxFrameTime: number = 0.25;
  
  private updateCallback: (dt: number) => void;
  private renderCallback: (alpha: number) => void;
  
  frameCount: number = 0;
  fps: number = 60;
  private fpsTime: number = 0;
  private fpsFrames: number = 0;

  constructor(
    updateCallback: (dt: number) => void,
    renderCallback: (alpha: number) => void,
    targetFps: number = 60
  ) {
    this.fixedDt = 1 / targetFps;
    this.updateCallback = updateCallback;
    this.renderCallback = renderCallback;
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now() / 1000;
    this.loop();
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    this.running = false;
  }

  /**
   * Main loop
   */
  private loop = (): void => {
    if (!this.running) return;

    const currentTime = performance.now() / 1000;
    let frameTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Prevent spiral of death
    if (frameTime > this.maxFrameTime) {
      frameTime = this.maxFrameTime;
    }

    this.accumulator += frameTime;

    // Fixed timestep updates
    while (this.accumulator >= this.fixedDt) {
      this.updateCallback(this.fixedDt);
      this.accumulator -= this.fixedDt;
      this.frameCount++;
    }

    // Render with interpolation
    const alpha = this.accumulator / this.fixedDt;
    this.renderCallback(alpha);

    // Calculate FPS
    this.fpsFrames++;
    this.fpsTime += frameTime;
    if (this.fpsTime >= 1.0) {
      this.fps = this.fpsFrames / this.fpsTime;
      this.fpsFrames = 0;
      this.fpsTime = 0;
    }

    requestAnimationFrame(this.loop);
  };

  /**
   * Get current FPS
   */
  getFPS(): number {
    return Math.round(this.fps);
  }
}
