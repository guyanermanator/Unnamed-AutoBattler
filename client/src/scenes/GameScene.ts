import { Scene } from '../engine/scene/Scene';
import { Renderer } from '../engine/rendering/Renderer';
import { InputManager } from '../engine/input/InputManager';
import { UIManager } from '../engine/ui/UIManager';
import { Button } from '../engine/ui/widgets/Button';

/**
 * Main menu/game scene
 */
export class GameScene extends Scene {
  private uiManager: UIManager;
  private onStartRun?: () => void | Promise<void>;

  constructor(onStartRun?: () => void | Promise<void>) {
    super('GameScene');
    this.uiManager = new UIManager();
    this.onStartRun = onStartRun;
  }

  onEnter(): void {
    // Setup UI
    this.uiManager.addButton(new Button({
      x: 170,
      y: 100,
      width: 140,
      height: 30,
      text: 'Start Run',
      onClick: () => {
        void this.onStartRun?.();
      },
    }));

    this.uiManager.addButton(new Button({
      x: 170,
      y: 140,
      width: 140,
      height: 30,
      text: 'Collection',
      onClick: () => {
        console.log('Collection clicked');
      },
    }));

    this.uiManager.addButton(new Button({
      x: 170,
      y: 180,
      width: 140,
      height: 30,
      text: 'Settings',
      onClick: () => {
        console.log('Settings clicked');
      },
    }));
  }

  onExit(): void {
    this.uiManager.clear();
  }

  update(_dt: number): void {
    // Update game logic
  }

  render(renderer: Renderer): void {
    renderer.clear('#000000');

    // Draw title
    renderer.drawText('UNNAMED AUTO BATTLER', 240, 40, {
      color: '#ffffff',
      font: 'bold 16px "Courier New"',
      align: 'center',
    });

    // Render UI
    this.uiManager.render(renderer);
  }

  handleInput(input: InputManager): void {
    this.uiManager.handleInput(input);
  }
}
