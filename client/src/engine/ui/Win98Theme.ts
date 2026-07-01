import { Renderer } from '../rendering/Renderer';

/**
 * Windows 98 theme colors and drawing functions
 */
export class Win98Theme {
  static readonly BUTTON_FACE = '#c0c0c0';
  static readonly BUTTON_SHADOW = '#808080';
  static readonly BUTTON_DARK_SHADOW = '#000000';
  static readonly BUTTON_LIGHT = '#ffffff';
  static readonly BUTTON_HIGHLIGHT = '#dfdfdf';
  static readonly BUTTON_TEXT = '#000000';
  static readonly TITLE_BAR = '#000080';
  static readonly TITLE_BAR_TEXT = '#ffffff';
  static readonly WINDOW_BG = '#c0c0c0';
  static readonly BORDER = '#000000';

  /**
   * Draw a beveled button (3D effect)
   */
  static drawButton(
    renderer: Renderer,
    x: number,
    y: number,
    width: number,
    height: number,
    pressed: boolean = false
  ): void {
    const ctx = renderer.ctx;

    // Face
    ctx.fillStyle = Win98Theme.BUTTON_FACE;
    ctx.fillRect(x, y, width, height);

    if (!pressed) {
      // Top-left highlight
      ctx.fillStyle = Win98Theme.BUTTON_LIGHT;
      ctx.fillRect(x, y, width - 1, 1);
      ctx.fillRect(x, y, 1, height - 1);

      ctx.fillStyle = Win98Theme.BUTTON_HIGHLIGHT;
      ctx.fillRect(x + 1, y + 1, width - 3, 1);
      ctx.fillRect(x + 1, y + 1, 1, height - 3);

      // Bottom-right shadow
      ctx.fillStyle = Win98Theme.BUTTON_DARK_SHADOW;
      ctx.fillRect(x, y + height - 1, width, 1);
      ctx.fillRect(x + width - 1, y, 1, height);

      ctx.fillStyle = Win98Theme.BUTTON_SHADOW;
      ctx.fillRect(x + 1, y + height - 2, width - 2, 1);
      ctx.fillRect(x + width - 2, y + 1, 1, height - 2);
    } else {
      // Pressed - invert shadows
      ctx.fillStyle = Win98Theme.BUTTON_DARK_SHADOW;
      ctx.fillRect(x, y, width - 1, 1);
      ctx.fillRect(x, y, 1, height - 1);

      ctx.fillStyle = Win98Theme.BUTTON_SHADOW;
      ctx.fillRect(x + 1, y + 1, width - 2, 1);
      ctx.fillRect(x + 1, y + 1, 1, height - 2);
    }
  }

  /**
   * Draw a panel with beveled border
   */
  static drawPanel(
    renderer: Renderer,
    x: number,
    y: number,
    width: number,
    height: number,
    inset: boolean = true
  ): void {
    const ctx = renderer.ctx;

    // Background
    ctx.fillStyle = Win98Theme.WINDOW_BG;
    ctx.fillRect(x, y, width, height);

    if (inset) {
      // Top-left shadow (inset)
      ctx.fillStyle = Win98Theme.BUTTON_SHADOW;
      ctx.fillRect(x, y, width - 1, 1);
      ctx.fillRect(x, y, 1, height - 1);

      ctx.fillStyle = Win98Theme.BUTTON_DARK_SHADOW;
      ctx.fillRect(x + 1, y + 1, width - 3, 1);
      ctx.fillRect(x + 1, y + 1, 1, height - 3);

      // Bottom-right highlight
      ctx.fillStyle = Win98Theme.BUTTON_LIGHT;
      ctx.fillRect(x + 1, y + height - 1, width - 1, 1);
      ctx.fillRect(x + width - 1, y + 1, 1, height - 1);
    } else {
      // Raised border
      ctx.fillStyle = Win98Theme.BUTTON_LIGHT;
      ctx.fillRect(x, y, width - 1, 1);
      ctx.fillRect(x, y, 1, height - 1);

      ctx.fillStyle = Win98Theme.BUTTON_DARK_SHADOW;
      ctx.fillRect(x, y + height - 1, width, 1);
      ctx.fillRect(x + width - 1, y, 1, height);
    }
  }

  /**
   * Draw a window
   */
  static drawWindow(
    renderer: Renderer,
    x: number,
    y: number,
    width: number,
    height: number,
    title: string
  ): void {
    const ctx = renderer.ctx;
    const titleBarHeight = 18;

    // Outer border
    ctx.strokeStyle = Win98Theme.BORDER;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);

    // Title bar
    ctx.fillStyle = Win98Theme.TITLE_BAR;
    ctx.fillRect(x + 1, y + 1, width - 2, titleBarHeight);

    // Title text
    ctx.fillStyle = Win98Theme.TITLE_BAR_TEXT;
    ctx.font = 'bold 11px "MS Sans Serif", Arial';
    ctx.fillText(title, x + 4, y + 13);

    // Content area
    ctx.fillStyle = Win98Theme.WINDOW_BG;
    ctx.fillRect(x + 1, y + titleBarHeight + 1, width - 2, height - titleBarHeight - 2);

    // Inner border
    Win98Theme.drawPanel(renderer, x + 2, y + titleBarHeight + 2, width - 4, height - titleBarHeight - 4, false);
  }

  /**
   * Draw text with Win98 style
   */
  static drawText(
    renderer: Renderer,
    text: string,
    x: number,
    y: number,
    options?: {
      disabled?: boolean;
      centered?: boolean;
    }
  ): void {
    const ctx = renderer.ctx;
    ctx.font = '11px "MS Sans Serif", Arial';
    ctx.textBaseline = 'top';
    ctx.textAlign = options?.centered ? 'center' : 'left';

    if (options?.disabled) {
      // Draw embossed disabled text
      ctx.fillStyle = Win98Theme.BUTTON_LIGHT;
      ctx.fillText(text, x + 1, y + 1);
      ctx.fillStyle = Win98Theme.BUTTON_SHADOW;
      ctx.fillText(text, x, y);
    } else {
      ctx.fillStyle = Win98Theme.BUTTON_TEXT;
      ctx.fillText(text, x, y);
    }
  }
}
