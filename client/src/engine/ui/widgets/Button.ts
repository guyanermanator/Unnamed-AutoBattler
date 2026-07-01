import { Renderer } from '../../rendering/Renderer';
import { Win98Theme } from '../Win98Theme';

export interface ButtonOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * Windows 98 style button widget
 */
export class Button {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  onClick?: () => void;
  disabled: boolean;
  private pressed: boolean = false;

  constructor(options: ButtonOptions) {
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.text = options.text;
    this.onClick = options.onClick;
    this.disabled = options.disabled || false;
  }

  /**
   * Check if point is inside button
   */
  containsPoint(x: number, y: number): boolean {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }

  /**
   * Handle mouse down
   */
  onMouseDown(x: number, y: number): boolean {
    if (this.disabled) return false;
    if (this.containsPoint(x, y)) {
      this.pressed = true;
      return true;
    }
    return false;
  }

  /**
   * Handle mouse up
   */
  onMouseUp(x: number, y: number): boolean {
    if (this.disabled) return false;
    if (this.pressed && this.containsPoint(x, y)) {
      this.pressed = false;
      if (this.onClick) {
        this.onClick();
      }
      return true;
    }
    this.pressed = false;
    return false;
  }

  /**
   * Handle mouse move
   */
  onMouseMove(_x: number, _y: number): void {
    // this.hovered = this.containsPoint(x, y);
  }

  /**
   * Render button
   */
  render(renderer: Renderer): void {
    Win98Theme.drawButton(renderer, this.x, this.y, this.width, this.height, this.pressed);

    const textX = this.x + this.width / 2;
    const textY = this.y + (this.height - 11) / 2 + (this.pressed ? 1 : 0);

    Win98Theme.drawText(renderer, this.text, textX, textY, {
      disabled: this.disabled,
      centered: true,
    });
  }
}
