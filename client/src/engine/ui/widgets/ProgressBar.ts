import { Renderer } from '../../rendering/Renderer';
import { Win98Theme } from '../Win98Theme';

export interface ProgressBarOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  max: number;
  showText?: boolean;
}

/**
 * Windows 98 style progress bar widget
 */
export class ProgressBar {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  max: number;
  showText: boolean;

  constructor(options: ProgressBarOptions) {
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.value = options.value;
    this.max = options.max;
    this.showText = options.showText ?? true;
  }

  /**
   * Set current value
   */
  setValue(value: number): void {
    this.value = Math.max(0, Math.min(this.max, value));
  }

  /**
   * Get percentage
   */
  getPercentage(): number {
    return this.max > 0 ? (this.value / this.max) * 100 : 0;
  }

  /**
   * Render progress bar
   */
  render(renderer: Renderer): void {
    // Border
    Win98Theme.drawPanel(renderer, this.x, this.y, this.width, this.height, true);

    // Fill
    const fillWidth = ((this.width - 4) * this.value) / this.max;
    if (fillWidth > 0) {
      renderer.ctx.fillStyle = '#000080';
      renderer.ctx.fillRect(this.x + 2, this.y + 2, fillWidth, this.height - 4);
    }

    // Text
    if (this.showText) {
      const text = `${Math.round(this.getPercentage())}%`;
      const textX = this.x + this.width / 2;
      const textY = this.y + (this.height - 11) / 2;
      Win98Theme.drawText(renderer, text, textX, textY, { centered: true });
    }
  }
}
