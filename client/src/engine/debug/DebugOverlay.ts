import { Renderer } from '../rendering/Renderer';

export interface DebugStats {
  fps: number;
  entities: number;
  memory: number;
  drawCalls: number;
  seed: number;
}

/**
 * Debug overlay (F1 to toggle)
 */
export class DebugOverlay {
  private visible: boolean = false;
  private stats: DebugStats = {
    fps: 0,
    entities: 0,
    memory: 0,
    drawCalls: 0,
    seed: 0,
  };

  constructor() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F1') {
        this.toggle();
        e.preventDefault();
      }
    });
  }

  /**
   * Toggle visibility
   */
  toggle(): void {
    this.visible = !this.visible;
  }

  /**
   * Update stats
   */
  updateStats(stats: Partial<DebugStats>): void {
    Object.assign(this.stats, stats);
  }

  /**
   * Render debug overlay
   */
  render(renderer: Renderer): void {
    if (!this.visible) return;

    const x = 10;
    let y = 10;
    const lineHeight = 14;

    // Background
    renderer.drawRect(x - 5, y - 5, 150, 100, 'rgba(0, 0, 0, 0.7)');

    // Text
    renderer.drawText(`FPS: ${this.stats.fps}`, x, y, { color: '#0f0', font: '12px "Courier New"' });
    y += lineHeight;
    renderer.drawText(`Entities: ${this.stats.entities}`, x, y, { color: '#0f0', font: '12px "Courier New"' });
    y += lineHeight;
    renderer.drawText(`Memory: ${this.stats.memory.toFixed(2)} MB`, x, y, { color: '#0f0', font: '12px "Courier New"' });
    y += lineHeight;
    renderer.drawText(`Draw Calls: ${this.stats.drawCalls}`, x, y, { color: '#0f0', font: '12px "Courier New"' });
    y += lineHeight;
    renderer.drawText(`RNG Seed: ${this.stats.seed}`, x, y, { color: '#0f0', font: '12px "Courier New"' });
  }
}
