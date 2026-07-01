import { Scene } from '../engine/scene/Scene';
import { Renderer } from '../engine/rendering/Renderer';
import { InputManager } from '../engine/input/InputManager';
import { DungeonMapImpl } from '../game/dungeon/DungeonMap';
import { UIManager } from '../engine/ui/UIManager';

/**
 * Dungeon map scene
 */
export class DungeonScene extends Scene {
  private dungeonMap: DungeonMapImpl | null = null;
  private uiManager: UIManager;

  constructor() {
    super('DungeonScene');
    this.uiManager = new UIManager();
  }

  onEnter(): void {
    // Dungeon map will be set externally
  }

  onExit(): void {
    this.uiManager.clear();
  }

  /**
   * Set the dungeon map to display
   */
  setDungeonMap(map: DungeonMapImpl): void {
    this.dungeonMap = map;
  }

  update(_dt: number): void {
    // Update dungeon logic
  }

  render(renderer: Renderer): void {
    renderer.clear('#0d1117');

    if (!this.dungeonMap) return;

    // Draw dungeon title
    renderer.drawText('Dungeon Map', 240, 20, {
      color: '#ffffff',
      font: 'bold 14px "Courier New"',
      align: 'center',
    });

    // Draw nodes
    this.dungeonMap.nodes.forEach(node => {
      const x = node.x + 100;
      const y = node.y + 60;

      // Node color based on type
      let color = '#888888';
      if (node.completed) color = '#4CAF50';
      else if (node.available) color = '#FFC107';

      switch (node.type) {
        case 'combat':
          color = node.available ? '#F44336' : '#8B0000';
          break;
        case 'elite':
          color = node.available ? '#9C27B0' : '#4A148C';
          break;
        case 'boss':
          color = node.available ? '#FF5722' : '#BF360C';
          break;
        case 'merchant':
          color = node.available ? '#4CAF50' : '#1B5E20';
          break;
        case 'treasure':
          color = node.available ? '#FFD700' : '#FFA000';
          break;
        case 'campfire':
          color = node.available ? '#FF9800' : '#E65100';
          break;
      }

      if (node.completed) {
        color = '#333333';
      }

      // Draw connections
      node.connections.forEach(connId => {
        const targetNode = this.dungeonMap!.nodes.find(n => n.id === connId);
        if (targetNode) {
          const targetX = targetNode.x + 100;
          const targetY = targetNode.y + 60;
          renderer.drawLine(x, y, targetX, targetY, '#444444', 2);
        }
      });

      // Draw node circle
      renderer.drawCircle(x, y, 12, color, true);
      renderer.drawCircle(x, y, 12, '#ffffff', false);

      // Draw node icon/letter
      const letter = node.type[0].toUpperCase();
      renderer.drawText(letter, x, y - 4, {
        color: '#ffffff',
        font: 'bold 10px "Courier New"',
        align: 'center',
      });
    });

    // Render UI
    this.uiManager.render(renderer);
  }

  handleInput(input: InputManager): void {
    this.uiManager.handleInput(input);

    // Handle node clicking
    if (input.isMousePressed(0) && this.dungeonMap) {
      const mousePos = input.getMousePosition();

      this.dungeonMap.nodes.forEach(node => {
        if (!node.available || node.completed) return;

        const x = node.x + 100;
        const y = node.y + 60;
        const dist = Math.sqrt(
          Math.pow(mousePos.x - x, 2) + Math.pow(mousePos.y - y, 2)
        );

        if (dist < 12) {
          console.log(`Clicked node: ${node.id} (${node.type})`);
          // Navigate to node
        }
      });
    }
  }
}
