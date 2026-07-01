import { Vector2 } from '../math/Vector2';

export interface CameraOptions {
  virtualWidth: number;
  virtualHeight: number;
}

/**
 * Camera for 2D rendering with viewport and world/screen coordinate conversion
 */
export class Camera {
  position: Vector2;
  zoom: number = 1;
  virtualWidth: number;
  virtualHeight: number;

  constructor(options: CameraOptions) {
    this.virtualWidth = options.virtualWidth;
    this.virtualHeight = options.virtualHeight;
    this.position = new Vector2(this.virtualWidth / 2, this.virtualHeight / 2);
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  worldToScreen(worldPos: Vector2): Vector2 {
    return new Vector2(
      (worldPos.x - this.position.x) * this.zoom + this.virtualWidth / 2,
      (worldPos.y - this.position.y) * this.zoom + this.virtualHeight / 2
    );
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(screenPos: Vector2): Vector2 {
    return new Vector2(
      (screenPos.x - this.virtualWidth / 2) / this.zoom + this.position.x,
      (screenPos.y - this.virtualHeight / 2) / this.zoom + this.position.y
    );
  }

  /**
   * Check if a point is visible in the camera viewport
   */
  isVisible(worldPos: Vector2, margin: number = 0): boolean {
    const halfWidth = (this.virtualWidth / 2) / this.zoom + margin;
    const halfHeight = (this.virtualHeight / 2) / this.zoom + margin;

    return (
      worldPos.x >= this.position.x - halfWidth &&
      worldPos.x <= this.position.x + halfWidth &&
      worldPos.y >= this.position.y - halfHeight &&
      worldPos.y <= this.position.y + halfHeight
    );
  }

  /**
   * Move camera to follow a target
   */
  follow(target: Vector2, lerp: number = 0.1): void {
    this.position.x += (target.x - this.position.x) * lerp;
    this.position.y += (target.y - this.position.y) * lerp;
  }

  /**
   * Shake the camera
   */
  shake(_intensity: number, _duration: number): void {
    // TODO: Implement camera shake
  }
}
