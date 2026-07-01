import { DungeonMap } from '@unnamed-auto-battler/shared';
import { DungeonNodeImpl } from './DungeonNode';

const MAX_DEPTH = 5;

/**
 * Dungeon map implementation
 */
export class DungeonMapImpl implements DungeonMap {
  seed: number;
  nodes: DungeonNodeImpl[];
  currentNode?: string;
  depth: number;
  maxDepth: number;

  constructor(seed: number) {
    this.seed = seed;
    this.nodes = [];
    this.depth = 0;
    this.maxDepth = MAX_DEPTH;
  }
}
