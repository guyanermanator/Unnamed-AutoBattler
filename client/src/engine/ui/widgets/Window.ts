import { Renderer } from '../../rendering/Renderer';
import { Win98Theme } from '../Win98Theme';
import { Button } from './Button';

export interface WindowOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  closable?: boolean;
  onClose?: () => void;
}

/**
 * Windows 98 style window widget
 */
export class Window {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  closable: boolean;
  onClose?: () => void;
  visible: boolean = true;
  private closeButton?: Button;
  private readonly titleBarHeight: number = 18;

  constructor(options: WindowOptions) {
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.title = options.title;
    this.closable = options.closable ?? true;
    this.onClose = options.onClose;

    if (this.closable) {
      this.closeButton = new Button({
        x: this.x + this.width - 18,
        y: this.y + 2,
        width: 16,
        height: 14,
        text: 'X',
        onClick: () => {
          if (this.onClose) {
            this.onClose();
          }
          this.visible = false;
        },
      });
    }
  }

  /**
   * Get content area bounds
   */
  getContentArea(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x + 6,
      y: this.y + this.titleBarHeight + 6,
      width: this.width - 12,
      height: this.height - this.titleBarHeight - 12,
    };
  }

  /**
   * Handle mouse down
   */
  onMouseDown(x: number, y: number): boolean {
    if (!this.visible) return false;
    if (this.closeButton) {
      return this.closeButton.onMouseDown(x, y);
    }
    return false;
  }

  /**
   * Handle mouse up
   */
  onMouseUp(x: number, y: number): boolean {
    if (!this.visible) return false;
    if (this.closeButton) {
      return this.closeButton.onMouseUp(x, y);
    }
    return false;
  }

  /**
   * Handle mouse move
   */
  onMouseMove(x: number, y: number): void {
    if (!this.visible) return;
    if (this.closeButton) {
      this.closeButton.onMouseMove(x, y);
    }
  }

  /**
   * Render window
   */
  render(renderer: Renderer): void {
    if (!this.visible) return;

    Win98Theme.drawWindow(renderer, this.x, this.y, this.width, this.height, this.title);

    if (this.closeButton) {
      this.closeButton.render(renderer);
    }
  }
}
