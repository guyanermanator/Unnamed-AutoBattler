import { Scene } from '../engine/scene/Scene';
import { Renderer } from '../engine/rendering/Renderer';
import { InputManager } from '../engine/input/InputManager';
import { CombatSimulator } from '../game/combat/CombatSimulator';
import { Unit } from '../game/units/Unit';
import { UIManager } from '../engine/ui/UIManager';
import { ProgressBar } from '../engine/ui/widgets/ProgressBar';

/**
 * Combat scene
 */
export class CombatScene extends Scene {
  private simulator: CombatSimulator | null = null;
  private uiManager: UIManager;
  private healthBars: Map<string, ProgressBar> = new Map();
  private combatFinished: boolean = false;

  constructor() {
    super('CombatScene');
    this.uiManager = new UIManager();
  }

  onEnter(): void {
    // Combat will be initialized externally via startCombat
  }

  onExit(): void {
    this.uiManager.clear();
    this.healthBars.clear();
  }

  /**
   * Start combat with two teams
   */
  startCombat(allies: Unit[], enemies: Unit[], seed: number): void {
    this.simulator = new CombatSimulator(seed);
    this.simulator.initialize(allies, enemies);
    this.combatFinished = false;

    // Create health bars for all units
    this.simulator.getAllUnits().forEach(unit => {
      const bar = new ProgressBar({
        x: 0,
        y: 0,
        width: 40,
        height: 5,
        value: unit.stats.health,
        max: unit.stats.maxHealth,
        showText: false,
      });
      this.healthBars.set(unit.id, bar);
      this.uiManager.addProgressBar(bar);
    });
  }

  update(dt: number): void {
    if (!this.simulator || this.combatFinished) return;

    // Update combat simulation
    this.combatFinished = this.simulator.update(dt);

    // Update health bar values and positions
    this.simulator.getAllUnits().forEach(unit => {
      const bar = this.healthBars.get(unit.id);
      if (bar) {
        bar.x = unit.transform.position.x - 20;
        bar.y = unit.transform.position.y - 30;
        bar.setValue(unit.stats.health);
      }
    });
  }

  render(renderer: Renderer): void {
    renderer.clear('#1a1a2e');

    if (!this.simulator) return;

    // Draw battlefield
    renderer.drawRect(50, 50, 380, 200, '#2a2a3e');

    // Draw units
    this.simulator.getAllUnits().forEach(unit => {
      if (!unit.stats.isAlive()) return;

      const color = unit.team === 'ally' ? '#4CAF50' : '#F44336';
      const x = unit.transform.position.x;
      const y = unit.transform.position.y;

      // Draw unit circle
      renderer.drawCircle(x, y, 10, color, true);

      // Draw name
      renderer.drawText(unit.name, x, y + 15, {
        color: '#ffffff',
        font: '8px "Courier New"',
        align: 'center',
      });
    });

    // Draw projectiles
    this.simulator.getProjectiles().forEach(proj => {
      renderer.drawCircle(proj.position.x, proj.position.y, 3, '#FFC107', true);
    });

    // Render UI (health bars)
    this.uiManager.render(renderer);

    // Combat finished overlay
    if (this.combatFinished) {
      renderer.drawRect(140, 100, 200, 80, 'rgba(0, 0, 0, 0.8)');
      renderer.drawText('Combat Finished!', 240, 120, {
        color: '#ffffff',
        font: 'bold 14px "Courier New"',
        align: 'center',
      });
      renderer.drawText('Press ESC to continue', 240, 145, {
        color: '#aaaaaa',
        font: '10px "Courier New"',
        align: 'center',
      });
    }
  }

  handleInput(input: InputManager): void {
    if (this.combatFinished && input.isKeyPressed('Escape')) {
      // Return to previous scene
    }

    this.uiManager.handleInput(input);
  }
}
