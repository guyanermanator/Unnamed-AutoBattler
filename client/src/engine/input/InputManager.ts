import { Vector2 } from '../math/Vector2';

export interface MouseState {
  position: Vector2;
  buttons: Set<number>;
  wheel: number;
}

export interface KeyboardState {
  keys: Set<string>;
}

/**
 * Input manager for keyboard and mouse
 */
export class InputManager {
  private mouse: MouseState;
  private keyboard: KeyboardState;
  private canvas: HTMLCanvasElement;
  private virtualWidth: number;
  private virtualHeight: number;
  private prevMouse: MouseState;
  private prevKeyboard: KeyboardState;

  constructor(canvas: HTMLCanvasElement, virtualWidth?: number, virtualHeight?: number) {
    this.canvas = canvas;
    this.virtualWidth = virtualWidth ?? canvas.width;
    this.virtualHeight = virtualHeight ?? canvas.height;
    this.mouse = {
      position: new Vector2(),
      buttons: new Set(),
      wheel: 0,
    };
    this.keyboard = {
      keys: new Set(),
    };
    this.prevMouse = {
      position: new Vector2(),
      buttons: new Set(),
      wheel: 0,
    };
    this.prevKeyboard = {
      keys: new Set(),
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Mouse events
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.position.set(
        ((e.clientX - rect.left) / rect.width) * this.virtualWidth,
        ((e.clientY - rect.top) / rect.height) * this.virtualHeight
      );
    });

    this.canvas.addEventListener('mousedown', (e) => {
      this.mouse.buttons.add(e.button);
    });

    this.canvas.addEventListener('mouseup', (e) => {
      this.mouse.buttons.delete(e.button);
    });

    this.canvas.addEventListener('wheel', (e) => {
      this.mouse.wheel = e.deltaY;
      e.preventDefault();
    });

    // Keyboard events
    window.addEventListener('keydown', (e) => {
      this.keyboard.keys.add(e.key);
    });

    window.addEventListener('keyup', (e) => {
      this.keyboard.keys.delete(e.key);
    });

    // Prevent context menu
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  /**
   * Update input state (call at end of frame)
   */
  update(): void {
    this.prevMouse.position = this.mouse.position.clone();
    this.prevMouse.buttons = new Set(this.mouse.buttons);
    this.prevKeyboard.keys = new Set(this.keyboard.keys);
    this.mouse.wheel = 0;
  }

  /**
   * Check if key is currently pressed
   */
  isKeyDown(key: string): boolean {
    return this.keyboard.keys.has(key);
  }

  /**
   * Check if key was just pressed this frame
   */
  isKeyPressed(key: string): boolean {
    return this.keyboard.keys.has(key) && !this.prevKeyboard.keys.has(key);
  }

  /**
   * Check if key was just released this frame
   */
  isKeyReleased(key: string): boolean {
    return !this.keyboard.keys.has(key) && this.prevKeyboard.keys.has(key);
  }

  /**
   * Check if mouse button is currently pressed
   */
  isMouseDown(button: number = 0): boolean {
    return this.mouse.buttons.has(button);
  }

  /**
   * Check if mouse button was just pressed this frame
   */
  isMousePressed(button: number = 0): boolean {
    return this.mouse.buttons.has(button) && !this.prevMouse.buttons.has(button);
  }

  /**
   * Check if mouse button was just released this frame
   */
  isMouseReleased(button: number = 0): boolean {
    return !this.mouse.buttons.has(button) && this.prevMouse.buttons.has(button);
  }

  /**
   * Get current mouse position
   */
  getMousePosition(): Vector2 {
    return this.mouse.position.clone();
  }

  /**
   * Get mouse wheel delta
   */
  getMouseWheel(): number {
    return this.mouse.wheel;
  }
}
