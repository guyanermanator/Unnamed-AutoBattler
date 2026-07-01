export type NodeType = 
  | 'combat' 
  | 'elite' 
  | 'merchant' 
  | 'treasure' 
  | 'campfire' 
  | 'random_event' 
  | 'boss';

export interface DungeonNode {
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
}

export interface DungeonMap {
  seed: number;
  nodes: DungeonNode[];
  currentNode?: string;
  depth: number;
  maxDepth: number;
}

export interface DungeonProgress {
  mapId: string;
  completedNodes: string[];
  currentNode?: string;
  floor: number;
}
