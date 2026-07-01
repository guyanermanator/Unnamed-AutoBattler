import { Vector2 } from '../../engine/math/Vector2';

const GRID_SIZE = 20;
const BATTLEFIELD_WIDTH = 800;
const BATTLEFIELD_HEIGHT = 400;

/**
 * Battlefield grid for unit positioning and pathfinding
 */
export class Battlefield {
  width: number;
  height: number;
  gridWidth: number;
  gridHeight: number;
  grid: boolean[][];

  constructor(width: number = BATTLEFIELD_WIDTH, height: number = BATTLEFIELD_HEIGHT) {
    this.width = width;
    this.height = height;
    this.gridWidth = Math.floor(width / GRID_SIZE);
    this.gridHeight = Math.floor(height / GRID_SIZE);
    this.grid = this.createGrid();
  }

  private createGrid(): boolean[][] {
    const grid: boolean[][] = [];
    for (let y = 0; y < this.gridHeight; y++) {
      grid[y] = [];
      for (let x = 0; x < this.gridWidth; x++) {
        grid[y][x] = false; // false = walkable
      }
    }
    return grid;
  }

  /**
   * World position to grid coordinates
   */
  worldToGrid(pos: Vector2): { x: number; y: number } {
    return {
      x: Math.floor(pos.x / GRID_SIZE),
      y: Math.floor(pos.y / GRID_SIZE),
    };
  }

  /**
   * Grid coordinates to world position
   */
  gridToWorld(gridX: number, gridY: number): Vector2 {
    return new Vector2(
      gridX * GRID_SIZE + GRID_SIZE / 2,
      gridY * GRID_SIZE + GRID_SIZE / 2
    );
  }

  /**
   * Check if grid cell is walkable
   */
  isWalkable(gridX: number, gridY: number): boolean {
    if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) {
      return false;
    }
    return !this.grid[gridY][gridX];
  }

  /**
   * Get random spawn position
   */
  getRandomSpawnPosition(side: 'left' | 'right'): Vector2 {
    const x = side === 'left' ? GRID_SIZE * 2 : this.width - GRID_SIZE * 2;
    const y = GRID_SIZE * 2 + Math.random() * (this.height - GRID_SIZE * 4);
    return new Vector2(x, y);
  }

  /**
   * Simple A* pathfinding (simplified for performance)
   */
  findPath(start: Vector2, end: Vector2): Vector2[] {
    // For simplicity, just return direct path
    // In a full implementation, use proper A* algorithm
    return [start, end];
  }
}
