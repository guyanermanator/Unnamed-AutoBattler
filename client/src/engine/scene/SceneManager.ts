import { Scene } from './Scene';
import { Renderer } from '../rendering/Renderer';
import { InputManager } from '../input/InputManager';

/**
 * Manages scene transitions and updates
 */
export class SceneManager {
  private scenes: Map<string, Scene> = new Map();
  private currentScene: Scene | null = null;
  private nextScene: Scene | null = null;

  /**
   * Register a scene
   */
  registerScene(scene: Scene): void {
    this.scenes.set(scene.name, scene);
  }

  /**
   * Switch to a scene
   */
  switchTo(sceneName: string): void {
    const scene = this.scenes.get(sceneName);
    if (!scene) {
      console.error(`Scene "${sceneName}" not found`);
      return;
    }
    this.nextScene = scene;
  }

  /**
   * Update current scene
   */
  update(dt: number): void {
    // Handle scene transition
    if (this.nextScene) {
      if (this.currentScene) {
        this.currentScene.onExit();
      }
      this.currentScene = this.nextScene;
      this.currentScene.onEnter();
      this.nextScene = null;
    }

    if (this.currentScene) {
      this.currentScene.update(dt);
    }
  }

  /**
   * Render current scene
   */
  render(renderer: Renderer): void {
    if (this.currentScene) {
      this.currentScene.render(renderer);
    }
  }

  /**
   * Handle input for current scene
   */
  handleInput(input: InputManager): void {
    if (this.currentScene) {
      this.currentScene.handleInput(input);
    }
  }

  /**
   * Get current scene
   */
  getCurrentScene(): Scene | null {
    return this.currentScene;
  }
}
