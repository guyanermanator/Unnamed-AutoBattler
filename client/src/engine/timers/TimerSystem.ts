/**
 * Timer system for delayed callbacks
 */
export class TimerSystem {
  private timers: Map<string, {
    duration: number;
    elapsed: number;
    callback: () => void;
    repeat: boolean;
  }> = new Map();

  /**
   * Set a timer
   */
  setTimeout(id: string, duration: number, callback: () => void): void {
    this.timers.set(id, {
      duration,
      elapsed: 0,
      callback,
      repeat: false,
    });
  }

  /**
   * Set an interval
   */
  setInterval(id: string, duration: number, callback: () => void): void {
    this.timers.set(id, {
      duration,
      elapsed: 0,
      callback,
      repeat: true,
    });
  }

  /**
   * Clear a timer
   */
  clear(id: string): void {
    this.timers.delete(id);
  }

  /**
   * Clear all timers
   */
  clearAll(): void {
    this.timers.clear();
  }

  /**
   * Update timers
   */
  update(dt: number): void {
    this.timers.forEach((timer, id) => {
      timer.elapsed += dt;

      if (timer.elapsed >= timer.duration) {
        timer.callback();

        if (timer.repeat) {
          timer.elapsed -= timer.duration;
        } else {
          this.timers.delete(id);
        }
      }
    });
  }
}
