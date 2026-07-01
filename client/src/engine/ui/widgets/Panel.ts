import { Renderer } from '../../rendering/Renderer';
import { Win98Theme } from '../Win98Theme';

export interface PanelOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  inset?: boolean;
}

/**
 * Windows 98 style panel widget
 */
export class Panel {
  x: number;
  y: number;
  width: number;
  height: number;
  inset: boolean;

  constructor(options: PanelOptions) {
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.inset = options.inset ?? true;
  }

  /**
   * Render panel
   */
  render(renderer: Renderer): void {
    Win98Theme.drawPanel(renderer, this.x, this.y, this.width, this.height, this.inset);
  }
}
