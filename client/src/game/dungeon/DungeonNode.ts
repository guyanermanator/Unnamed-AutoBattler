import { DungeonNode, NodeType } from '@unnamed-auto-battler/shared';

/**
 * Dungeon node implementation
 */
export class DungeonNodeImpl implements DungeonNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  connections: string[];
  completed: boolean;
  available: boolean;
  data?: {
    enemyTeam?: string[];
    reward?: {
      gold?: number;
      items?: string[];
    };
    eventId?: string;
  };

  constructor(id: string, type: NodeType, x: number, y: number) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.connections = [];
    this.completed = false;
    this.available = false;
    this.data = {};
  }
}
