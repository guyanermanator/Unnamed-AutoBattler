import { Camera } from './Camera';

export interface RendererOptions {
  canvas: HTMLCanvasElement;
  virtualWidth: number;
  virtualHeight: number;
  pixelPerfect?: boolean;
}

/**
 * HTML5 Canvas renderer with pixel-perfect scaling
 */
export class Renderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  virtualWidth: number;
  virtualHeight: number;
  pixelPerfect: boolean;
  camera: Camera;
  private scale: number = 1;

  constructor(options: RendererOptions) {
    this.canvas = options.canvas;
    this.virtualWidth = options.virtualWidth;
    this.virtualHeight = options.virtualHeight;
    this.pixelPerfect = options.pixelPerfect ?? true;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;

    this.camera = new Camera({
      virtualWidth: this.virtualWidth,
      virtualHeight: this.virtualHeight,
    });

    // Set up pixel-perfect rendering
    if (this.pixelPerfect) {
      this.ctx.imageSmoothingEnabled = false;
    }

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  /**
   * Resize canvas to fit window with letterboxing
   */
  resize(): void {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const aspectRatio = this.virtualWidth / this.virtualHeight;
    const windowAspectRatio = windowWidth / windowHeight;

    let canvasWidth: number;
    let canvasHeight: number;

    if (windowAspectRatio > aspectRatio) {
      canvasHeight = windowHeight;
      canvasWidth = canvasHeight * aspectRatio;
    } else {
      canvasWidth = windowWidth;
      canvasHeight = canvasWidth / aspectRatio;
    }

    // Integer scaling for pixel-perfect rendering
    if (this.pixelPerfect) {
      this.scale = Math.max(1, Math.floor(Math.min(
        canvasWidth / this.virtualWidth,
        canvasHeight / this.virtualHeight
      )));
      canvasWidth = this.virtualWidth * this.scale;
      canvasHeight = this.virtualHeight * this.scale;
    }

    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    this.canvas.style.width = `${canvasWidth}px`;
    this.canvas.style.height = `${canvasHeight}px`;

    if (this.pixelPerfect) {
      this.ctx.imageSmoothingEnabled = false;
    }
  }

  /**
   * Clear the canvas
   */
  clear(color: string = '#000000'): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Begin a new frame
   */
  beginFrame(): void {
    this.ctx.save();
    this.ctx.scale(this.scale, this.scale);
  }

  /**
   * End the current frame
   */
  endFrame(): void {
    this.ctx.restore();
  }

  /**
   * Draw a rectangle
   */
  drawRect(x: number, y: number, width: number, height: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  /**
   * Draw text
   */
  drawText(text: string, x: number, y: number, options?: {
    color?: string;
    font?: string;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
  }): void {
    this.ctx.fillStyle = options?.color || '#ffffff';
    this.ctx.font = options?.font || '12px "Courier New"';
    this.ctx.textAlign = options?.align || 'left';
    this.ctx.textBaseline = options?.baseline || 'top';
    this.ctx.fillText(text, x, y);
  }

  /**
   * Draw a line
   */
  drawLine(x1: number, y1: number, x2: number, y2: number, color: string, width: number = 1): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  /**
   * Draw a circle
   */
  drawCircle(x: number, y: number, radius: number, color: string, fill: boolean = true): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    if (fill) {
      this.ctx.fillStyle = color;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
    }
  }
}
