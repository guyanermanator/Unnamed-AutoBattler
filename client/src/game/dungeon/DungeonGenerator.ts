import { NodeType } from '@unnamed-auto-battler/shared';
import { RNG } from '../../engine/rng/RNG';
import { DungeonMapImpl } from './DungeonMap';
import { DungeonNodeImpl } from './DungeonNode';

const NODES_PER_FLOOR = 7;
const FLOORS = 5;
const SPACING_X = 100;
const SPACING_Y = 80;

/**
 * Generates procedural dungeon maps (Slay the Spire style)
 */
export class DungeonGenerator {
  private rng: RNG;

  constructor(seed: number) {
    this.rng = new RNG(seed);
  }

  /**
   * Generate a new dungeon map
   */
  generate(): DungeonMapImpl {
    const map = new DungeonMapImpl(this.rng.getSeed());
    let nodeId = 0;

    // Generate nodes for each floor
    for (let floor = 0; floor < FLOORS; floor++) {
      const nodesInFloor = floor === FLOORS - 1 ? 1 : NODES_PER_FLOOR;

      for (let i = 0; i < nodesInFloor; i++) {
        const x = i * SPACING_X + this.rng.nextFloat(-10, 10);
        const y = floor * SPACING_Y;
        const type = this.selectNodeType(floor, i, nodesInFloor);
        const node = new DungeonNodeImpl(`node_${nodeId++}`, type, x, y);
        map.nodes.push(node);
      }
    }

    // Connect nodes between floors
    this.connectNodes(map);

    // Mark starting nodes as available
    map.nodes.filter(n => n.y === 0).forEach(n => n.available = true);

    return map;
  }

  /**
   * Select node type based on floor and position
   */
  private selectNodeType(floor: number, _index: number, _total: number): NodeType {
    // Last floor is always boss
    if (floor === FLOORS - 1) {
      return 'boss';
    }

    // First floor is always combat
    if (floor === 0) {
      return 'combat';
    }

    const roll = this.rng.next();

    if (roll < 0.5) return 'combat';
    if (roll < 0.6) return 'elite';
    if (roll < 0.75) return 'merchant';
    if (roll < 0.85) return 'treasure';
    if (roll < 0.95) return 'campfire';
    return 'random_event';
  }

  /**
   * Connect nodes between adjacent floors
   */
  private connectNodes(map: DungeonMapImpl): void {
    const nodesByFloor: DungeonNodeImpl[][] = [];

    // Group nodes by floor
    const maxY = Math.max(...map.nodes.map(n => n.y));
    for (let y = 0; y <= maxY; y += SPACING_Y) {
      nodesByFloor.push(map.nodes.filter(n => Math.abs(n.y - y) < 1));
    }

    // Connect each floor to next
    for (let i = 0; i < nodesByFloor.length - 1; i++) {
      const currentFloor = nodesByFloor[i];
      const nextFloor = nodesByFloor[i + 1];

      currentFloor.forEach(node => {
        // Connect to 1-3 nodes in next floor
        const connectionCount = this.rng.nextInt(1, Math.min(3, nextFloor.length));
        const availableNodes = [...nextFloor];

        for (let c = 0; c < connectionCount; c++) {
          if (availableNodes.length === 0) break;

          const targetIndex = this.rng.nextInt(0, availableNodes.length - 1);
          const target = availableNodes[targetIndex];

          node.connections.push(target.id);
          availableNodes.splice(targetIndex, 1);
        }
      });
    }
  }
}
