import { Renderer } from './engine/rendering/Renderer';
import { GameLoop } from './engine/GameLoop';
import { SceneManager } from './engine/scene/SceneManager';
import { InputManager } from './engine/input/InputManager';
import { AssetManager } from './engine/assets/AssetManager';
import { AudioManager } from './engine/audio/AudioManager';
import { DebugOverlay } from './engine/debug/DebugOverlay';
import { RNG } from './engine/rng/RNG';
import { GameScene } from './scenes/GameScene';
import { CombatScene } from './scenes/CombatScene';
import { DungeonScene } from './scenes/DungeonScene';
import { UnitLoader } from './game/units/UnitLoader';
import { Unit } from './game/units/Unit';
import { Vector2 } from './engine/math/Vector2';

const VIRTUAL_WIDTH = 480;
const VIRTUAL_HEIGHT = 270;

/**
 * Main game class
 */
export class Game {
  private renderer: Renderer;
  private gameLoop: GameLoop;
  private sceneManager: SceneManager;
  private inputManager: InputManager;
  private assetManager: AssetManager;
  private audioManager: AudioManager;
  private debugOverlay: DebugOverlay;
  private rng: RNG;
  private unitLoader: UnitLoader;
  private gameScene: GameScene;
  private combatScene: CombatScene;
  private dungeonScene: DungeonScene;

  constructor(canvas: HTMLCanvasElement) {
    // Initialize systems
    this.renderer = new Renderer({
      canvas,
      virtualWidth: VIRTUAL_WIDTH,
      virtualHeight: VIRTUAL_HEIGHT,
      pixelPerfect: true,
    });

    this.inputManager = new InputManager(canvas, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    this.assetManager = new AssetManager();
    this.audioManager = new AudioManager();
    this.debugOverlay = new DebugOverlay();
    this.rng = new RNG(Date.now());
    this.unitLoader = new UnitLoader(this.assetManager);

    // Initialize scene manager
    this.sceneManager = new SceneManager();
    this.gameScene = new GameScene(() => this.startDemoCombat());
    this.combatScene = new CombatScene(() => this.sceneManager.switchTo('GameScene'));
    this.dungeonScene = new DungeonScene();
    this.sceneManager.registerScene(this.gameScene);
    this.sceneManager.registerScene(this.combatScene);
    this.sceneManager.registerScene(this.dungeonScene);

    // Initialize game loop
    this.gameLoop = new GameLoop(
      (dt) => this.update(dt),
      (alpha) => this.render(alpha),
      60
    );
  }

  /**
   * Start the game
   */
  async start(): Promise<void> {
    console.log('Starting game...');

    // Load initial assets
    // await this.loadAssets();

    // Start with main scene
    this.sceneManager.switchTo('GameScene');

    // Start game loop
    this.gameLoop.start();
  }

  /**
   * Load game assets
   */
  // private async loadAssets(): Promise<void> {
  //   // TODO: Load game assets
  //   console.log('Loading assets...');
  // }

  /**
   * Update game state
   */
  private update(dt: number): void {
    // Update scene
    this.sceneManager.update(dt);

    // Handle input
    this.sceneManager.handleInput(this.inputManager);

    // Update input state
    this.inputManager.update();

    // Update debug overlay
    const perfAny = performance as any;
    if (perfAny.memory) {
      this.debugOverlay.updateStats({
        fps: this.gameLoop.getFPS(),
        entities: 0, // TODO: Track entity count
        memory: perfAny.memory.usedJSHeapSize / 1048576,
        drawCalls: 0,
        seed: this.rng.getSeed(),
      });
    }
  }

  /**
   * Render game
   */
  private render(_alpha: number): void {
    this.renderer.beginFrame();
    this.renderer.clear('#000000');

    // Render current scene
    this.sceneManager.render(this.renderer);

    // Render debug overlay
    this.debugOverlay.render(this.renderer);

    this.renderer.endFrame();
  }

  /**
   * Get asset manager
   */
  getAssetManager(): AssetManager {
    return this.assetManager;
  }

  /**
   * Get audio manager
   */
  getAudioManager(): AudioManager {
    return this.audioManager;
  }

  /**
   * Get RNG
   */
  getRNG(): RNG {
    return this.rng;
  }

  private async startDemoCombat(): Promise<void> {
    const allyIds = ['unit_knight', 'unit_archer', 'unit_mage', 'unit_knight'];
    const enemyIds = ['unit_knight', 'unit_archer', 'unit_mage', 'unit_archer', 'unit_knight'];
    const [allies, enemies] = await Promise.all([
      this.createUnits(allyIds, 'ally'),
      this.createUnits(enemyIds, 'enemy'),
    ]);

    this.combatScene.startCombat(allies, enemies, this.rng.getSeed());
    this.sceneManager.switchTo('CombatScene');
  }

  private async createUnits(unitIds: string[], team: 'ally' | 'enemy'): Promise<Unit[]> {
    const data = await this.unitLoader.loadMultiple(unitIds);
    return data.map(unitData => new Unit(unitData, team, Vector2.zero));
  }
}
