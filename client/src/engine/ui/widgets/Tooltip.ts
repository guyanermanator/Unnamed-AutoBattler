import { Renderer } from '../../rendering/Renderer';
import { Win98Theme } from '../Win98Theme';

export interface TooltipOptions {
  text: string;
  maxWidth?: number;
}

/**
 * Windows 98 style tooltip widget
 */
export class Tooltip {
  text: string;
  maxWidth: number;
  visible: boolean = false;
  x: number = 0;
  y: number = 0;

  constructor(options: TooltipOptions) {
    this.text = options.text;
    this.maxWidth = options.maxWidth || 200;
  }

  /**
   * Show tooltip at position
   */
  show(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.visible = true;
  }

  /**
   * Hide tooltip
   */
  hide(): void {
    this.visible = false;
  }

  /**
   * Render tooltip
   */
  render(renderer: Renderer): void {
    if (!this.visible) return;

    const ctx = renderer.ctx;
    const padding = 4;
    const lineHeight = 14;

    // Measure text
    ctx.font = '11px "MS Sans Serif", Arial';
    const metrics = ctx.measureText(this.text);
    const width = Math.min(metrics.width + padding * 2, this.maxWidth);
    const height = lineHeight + padding * 2;

    // Background
    ctx.fillStyle = '#ffffcc';
    ctx.fillRect(this.x, this.y, width, height);

    // Border
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(this.x, this.y, width, height);

    // Text
    Win98Theme.drawText(renderer, this.text, this.x + padding, this.y + padding);
  }
}
