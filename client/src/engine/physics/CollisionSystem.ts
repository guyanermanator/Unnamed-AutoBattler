import { Vector2 } from '../math/Vector2';

export interface AABB {
  min: Vector2;
  max: Vector2;
}

/**
 * Simple AABB collision system
 */
export class CollisionSystem {
  /**
   * Check if two AABBs overlap
   */
  static testAABB(a: AABB, b: AABB): boolean {
    return (
      a.min.x < b.max.x &&
      a.max.x > b.min.x &&
      a.min.y < b.max.y &&
      a.max.y > b.min.y
    );
  }

  /**
   * Check if point is inside AABB
   */
  static pointInAABB(point: Vector2, aabb: AABB): boolean {
    return (
      point.x >= aabb.min.x &&
      point.x <= aabb.max.x &&
      point.y >= aabb.min.y &&
      point.y <= aabb.max.y
    );
  }

  /**
   * Create AABB from position and size
   */
  static createAABB(position: Vector2, width: number, height: number): AABB {
    return {
      min: new Vector2(position.x - width / 2, position.y - height / 2),
      max: new Vector2(position.x + width / 2, position.y + height / 2),
    };
  }
}
