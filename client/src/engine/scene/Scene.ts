import { Renderer } from '../rendering/Renderer';
import { InputManager } from '../input/InputManager';

/**
 * Base scene interface
 */
export abstract class Scene {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Called when scene is loaded
   */
  abstract onEnter(): void;

  /**
   * Called when scene is unloaded
   */
  abstract onExit(): void;

  /**
   * Update scene logic
   */
  abstract update(dt: number): void;

  /**
   * Render scene
   */
  abstract render(renderer: Renderer): void;

  /**
   * Handle input
   */
  abstract handleInput(input: InputManager): void;
}
