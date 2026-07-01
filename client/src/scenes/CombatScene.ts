import { Scene } from '../engine/scene/Scene';
import { Renderer } from '../engine/rendering/Renderer';
import { InputManager } from '../engine/input/InputManager';
import { Win98Theme } from '../engine/ui/Win98Theme';
import { CombatSimulator } from '../game/combat/CombatSimulator';
import {
  CombatPresentation,
  type EnemyPresentationState,
  type PresentationUnitState,
} from '../game/combat/CombatPresentation';
import { Unit } from '../game/units/Unit';
import { Vector2 } from '../engine/math/Vector2';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const PARTY_CARD_BORDER = 2;
const PARTY_CARD_INNER_BORDER = 4;
const MAX_VISIBLE_LOG_ENTRIES = 7;

/**
 * First-person combat presentation scene
 */
export class CombatScene extends Scene {
  private simulator: CombatSimulator | null = null;
  private presentation = new CombatPresentation();
  private combatFinished = false;
  private allies: Unit[] = [];
  private enemies: Unit[] = [];
  private portraitCache = new Map<string, HTMLCanvasElement>();
  private enemyCache = new Map<string, HTMLCanvasElement>();
  private onLeaveCombat?: () => void;

  constructor(onLeaveCombat?: () => void) {
    super('CombatScene');
    this.onLeaveCombat = onLeaveCombat;
  }

  onEnter(): void {
    this.presentation.setLogCollapsed(true);
  }

  onExit(): void {
    this.presentation.destroy();
  }

  startCombat(allies: Unit[], enemies: Unit[], seed: number): void {
    this.allies = allies;
    this.enemies = enemies;
    this.simulator = new CombatSimulator(seed);
    this.simulator.initialize(allies, enemies);
    this.presentation.bind(allies, enemies);
    this.combatFinished = false;
  }

  update(dt: number): void {
    if (!this.simulator) return;

    if (!this.combatFinished) {
      this.combatFinished = this.simulator.update(dt);
    }

    this.presentation.update(dt);
  }

  render(renderer: Renderer): void {
    renderer.clear('#0f1723');

    if (!this.simulator) {
      this.renderEmptyState(renderer);
      return;
    }

    const viewport = { x: 10, y: 10, width: 460, height: 150 };
    const partyPanel = { x: 10, y: 176, width: 460, height: 84 };
    const logPanel = this.presentation.isLogCollapsed()
      ? { x: 328, y: 144, width: 142, height: 20 }
      : { x: 290, y: 34, width: 180, height: 132 };

    const partyStates = this.presentation.getPartyStates();
    const enemyStates = this.presentation.getEnemyStates();
    const anchors = new Map<string, Vector2>();

    renderer.ctx.save();
    const shake = this.presentation.getShakeOffset();
    renderer.ctx.translate(shake.x, shake.y);
    this.renderEncounterWindow(renderer, viewport);
    this.renderProjectileTrails(renderer, enemyStates, partyStates, anchors);
    this.renderEnemies(renderer, enemyStates, anchors);
    renderer.ctx.restore();

    this.renderBossFrame(renderer, enemyStates);
    this.renderPartyPanel(renderer, partyPanel, partyStates, anchors);
    this.renderCombatLog(renderer, logPanel);
    this.renderFloatingTexts(renderer, anchors);
    this.renderStatusBar(renderer);
    this.renderOverlayFlash(renderer);

    if (this.combatFinished) {
      this.renderFinishOverlay(renderer);
    }
  }

  handleInput(input: InputManager): void {
    if (input.isKeyPressed('l') || input.isKeyPressed('L')) {
      this.presentation.toggleCombatLog();
    }

    if (input.isMousePressed(0)) {
      const mouse = input.getMousePosition();
      const buttonRect = this.presentation.isLogCollapsed()
        ? { x: 330, y: 146, width: 138, height: 16 }
        : { x: 292, y: 36, width: 176, height: 18 };

      if (this.isInside(mouse, buttonRect)) {
        this.presentation.toggleCombatLog();
      }
    }

    if (this.combatFinished && input.isKeyPressed('Escape')) {
      this.onLeaveCombat?.();
    }
  }

  private renderEmptyState(renderer: Renderer): void {
    Win98Theme.drawWindow(renderer, 80, 70, 320, 110, 'Combat Viewer');
    renderer.drawText('No combat is active.', 240, 115, {
      color: '#000000',
      font: '12px "MS Sans Serif", Arial',
      align: 'center',
    });
  }

  private renderEncounterWindow(renderer: Renderer, rect: Rect): void {
    Win98Theme.drawWindow(renderer, rect.x, rect.y, rect.width, rect.height, 'Encounter Viewer');

    const innerX = rect.x + 8;
    const innerY = rect.y + 26;
    const innerWidth = rect.width - 16;
    const innerHeight = rect.height - 36;
    const ctx = renderer.ctx;

    const gradient = ctx.createLinearGradient(innerX, innerY, innerX, innerY + innerHeight);
    gradient.addColorStop(0, '#40546d');
    gradient.addColorStop(0.5, '#223146');
    gradient.addColorStop(1, '#161d2b');
    ctx.fillStyle = gradient;
    ctx.fillRect(innerX, innerY, innerWidth, innerHeight);

    const floorGradient = ctx.createLinearGradient(innerX, innerY + innerHeight - 50, innerX, innerY + innerHeight);
    floorGradient.addColorStop(0, '#4b3e2e');
    floorGradient.addColorStop(1, '#221a15');
    ctx.fillStyle = floorGradient;
    ctx.fillRect(innerX, innerY + innerHeight - 50, innerWidth, 50);

    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(innerX + 20, innerY + 8, 28, innerHeight - 16);
    ctx.fillRect(innerX + innerWidth - 48, innerY + 8, 28, innerHeight - 16);

    for (let i = 0; i < 10; i++) {
      const x = innerX + 18 + i * 42;
      const y = innerY + 12 + Math.sin(i * 0.8) * 5;
      renderer.drawCircle(x, y, 10, 'rgba(255,255,255,0.04)', true);
    }

    ctx.fillStyle = 'rgba(255, 220, 150, 0.12)';
    ctx.fillRect(innerX + 70, innerY + 10, 36, innerHeight - 20);
    ctx.fillRect(innerX + innerWidth - 108, innerY + 10, 36, innerHeight - 20);
  }

  private renderEnemies(
    renderer: Renderer,
    enemies: EnemyPresentationState[],
    anchors: Map<string, Vector2>
  ): void {
    enemies
      .slice()
      .sort((a, b) => a.position.y - b.position.y)
      .forEach(state => {
        const size = 34 * state.scale;
        const asset = this.getEnemyArt(state.unit);
        const lungeOffset = state.animation === 'attack' ? Math.sin(state.animationTime * 16) * 10 : 0;
        const castLift = state.animation === 'cast' ? -5 : 0;
        const x = state.position.x + lungeOffset;
        const y = state.position.y + castLift;

        renderer.ctx.save();
        renderer.ctx.globalAlpha = state.unit.stats.isAlive() ? 1 : 0.35;
        renderer.drawImageCentered(asset, x, y, size * 1.35, size * 1.35);
        if (state.targetPulse > 0) {
          renderer.ctx.strokeStyle = `rgba(255, 220, 120, ${state.targetPulse})`;
          renderer.ctx.lineWidth = 2;
          renderer.ctx.strokeRect(x - size * 0.7, y - size * 0.8, size * 1.4, size * 1.5);
        }
        if (state.flash > 0) {
          renderer.ctx.fillStyle = `rgba(255,255,255,${state.flash * 0.6})`;
          renderer.ctx.fillRect(x - size * 0.65, y - size * 0.75, size * 1.3, size * 1.45);
        }
        renderer.ctx.restore();

        if (state.isBoss) {
          renderer.drawText(state.unit.name.toUpperCase(), x, y + size * 0.95, {
            color: '#ffe39f',
            font: 'bold 10px "Courier New"',
            align: 'center',
          });
        } else {
          renderer.drawText(state.unit.name, x, y + size * 0.9, {
            color: '#ffffff',
            font: '9px "Courier New"',
            align: 'center',
          });
        }

        anchors.set(state.unit.id, new Vector2(x, y - size * 0.3));
      });
  }

  private renderProjectileTrails(
    renderer: Renderer,
    enemies: EnemyPresentationState[],
    party: PresentationUnitState[],
    anchors: Map<string, Vector2>
  ): void {
    if (!this.simulator) return;

    const enemyAnchors = new Map(enemies.map(state => [state.unit.id, state.position]));
    const partyAnchors = new Map(
      party.map((state, index) => [state.unit.id, new Vector2(54 + index * 72, 214)])
    );

    this.simulator.getProjectiles().forEach(projectile => {
      const source =
        enemyAnchors.get(projectile.source.id) ??
        partyAnchors.get(projectile.source.id) ??
        new Vector2(240, 140);
      const target =
        enemyAnchors.get(projectile.target.id) ??
        partyAnchors.get(projectile.target.id) ??
        new Vector2(240, 140);

      const progress = this.getProjectileProgress(
        projectile.source.transform.position,
        projectile.target.transform.position,
        projectile.position
      );
      const current = Vector2.lerp(source, target, progress);
      anchors.set(projectile.target.id, target.clone());

      renderer.drawLine(source.x, source.y, current.x, current.y, 'rgba(255, 210, 96, 0.45)', 2);
      renderer.drawCircle(current.x, current.y, 3, '#ffe38a', true);
      renderer.drawCircle(current.x, current.y, 6, 'rgba(255, 227, 138, 0.2)', true);
    });
  }

  private renderPartyPanel(
    renderer: Renderer,
    rect: Rect,
    partyStates: PresentationUnitState[],
    anchors: Map<string, Vector2>
  ): void {
    Win98Theme.drawWindow(renderer, rect.x, rect.y, rect.width, rect.height, 'Party Monitor');

    const gap = 6;
    const contentX = rect.x + 8;
    const partyCount = Math.max(1, partyStates.length);
    const totalGap = gap * Math.max(0, partyStates.length - 1);
    const cardWidth = (rect.width - 16 - totalGap) / partyCount;
    const cardHeight = rect.height - 28;

    partyStates.forEach((state, index) => {
      const x = contentX + index * (cardWidth + gap);
      const y = rect.y + 22;
      this.renderPartyCard(renderer, { x, y, width: cardWidth, height: cardHeight }, state);
      anchors.set(state.unit.id, new Vector2(x + 22, y + 16));
    });
  }

  private renderPartyCard(renderer: Renderer, rect: Rect, state: PresentationUnitState): void {
    Win98Theme.drawPanel(renderer, rect.x, rect.y, rect.width, rect.height, true);

    const portraitSize = Math.min(26, rect.height - 16);
    const portraitX = rect.x + 6;
    const portraitY = rect.y + 6;
    const portrait = this.getPortraitArt(state.unit);

    renderer.drawRect(
      rect.x + PARTY_CARD_BORDER,
      rect.y + PARTY_CARD_BORDER,
      rect.width - PARTY_CARD_BORDER * 2,
      rect.height - PARTY_CARD_BORDER * 2,
      this.getRarityColor(state.unit.data.rarity)
    );
    renderer.drawRect(
      rect.x + PARTY_CARD_INNER_BORDER,
      rect.y + PARTY_CARD_INNER_BORDER,
      rect.width - PARTY_CARD_INNER_BORDER * 2,
      rect.height - PARTY_CARD_INNER_BORDER * 2,
      '#c0c0c0'
    );
    renderer.drawImage(portrait, portraitX, portraitY, portraitSize, portraitSize);

    if (state.flash > 0) {
      renderer.ctx.fillStyle = `rgba(255,255,255,${state.flash * 0.6})`;
      renderer.ctx.fillRect(portraitX, portraitY, portraitSize, portraitSize);
    }
    if (state.targetPulse > 0) {
      renderer.ctx.strokeStyle = `rgba(255, 235, 160, ${state.targetPulse})`;
      renderer.ctx.strokeRect(portraitX - 1, portraitY - 1, portraitSize + 2, portraitSize + 2);
    }

    this.renderPortraitExpression(renderer, portraitX, portraitY, portraitSize, state);

    renderer.drawText(state.unit.name, portraitX + portraitSize + 6, rect.y + 6, {
      color: '#000000',
      font: 'bold 9px "MS Sans Serif", Arial',
    });

    this.renderBar(renderer, portraitX + portraitSize + 6, rect.y + 20, rect.width - portraitSize - 16, 9,
      state.unit.stats.health,
      state.unit.stats.maxHealth,
      '#a40000',
      '#ff5555',
      `HP ${Math.ceil(state.unit.stats.health)}/${state.unit.stats.maxHealth}`);
    this.renderBar(renderer, portraitX + portraitSize + 6, rect.y + 34, rect.width - portraitSize - 16, 8,
      state.unit.stats.mana,
      state.unit.stats.maxMana,
      '#003a78',
      '#2d89ef',
      `MP ${Math.ceil(state.unit.stats.mana)}/${state.unit.stats.maxMana}`);

    this.renderStatusIcons(renderer, rect, state);
  }

  private renderStatusIcons(renderer: Renderer, rect: Rect, state: PresentationUnitState): void {
    const baseX = rect.x + 6;
    const y = rect.y + rect.height - 13;
    const statusEffects = state.unit.statusEffects.slice(0, 3);
    statusEffects.forEach((effect, index) => {
      renderer.drawRect(baseX + index * 8, y, 6, 6, this.getStatusColor(effect.type));
    });

    state.unit.data.traits.slice(0, 2).forEach((trait, index) => {
      const x = rect.x + rect.width - 20 + index * 8;
      renderer.drawRect(x, y, 6, 6, '#808000');
      renderer.drawText(trait.charAt(0).toUpperCase(), x + 3, y - 1, {
        color: '#000000',
        font: '7px "Courier New"',
        align: 'center',
      });
    });

    const readiness = state.unit.attackCooldown <= 0 ? 'READY' : `${state.unit.attackCooldown.toFixed(1)}s`;
    renderer.drawText(readiness, rect.x + rect.width - 6, rect.y + rect.height - 13, {
      color: state.unit.attackCooldown <= 0 ? '#006400' : '#7a0000',
      font: '7px "Courier New"',
      align: 'right',
    });
  }

  private renderCombatLog(renderer: Renderer, rect: Rect): void {
    Win98Theme.drawWindow(renderer, rect.x, rect.y, rect.width, rect.height, this.presentation.isLogCollapsed() ? 'Log +' : 'Combat Log');

    if (this.presentation.isLogCollapsed()) {
      renderer.drawText('Click or press L to expand.', rect.x + 8, rect.y + 24, {
        color: '#000000',
        font: '8px "MS Sans Serif", Arial',
      });
      return;
    }

    this.presentation.getCombatLog().slice(0, MAX_VISIBLE_LOG_ENTRIES).forEach((entry, index) => {
      const color =
        entry.emphasis === 'crit' ? '#8b0000' :
        entry.emphasis === 'system' ? '#000080' :
        entry.emphasis === 'status' ? '#006400' :
        '#000000';
      renderer.drawText(entry.text, rect.x + 8, rect.y + 24 + index * 13, {
        color,
        font: '8px "MS Sans Serif", Arial',
      });
    });
  }

  private renderBossFrame(renderer: Renderer, enemies: EnemyPresentationState[]): void {
    const boss = enemies.find(enemy => enemy.isBoss);
    if (!boss) return;

    Win98Theme.drawPanel(renderer, 70, 12, 340, 18, false);
    renderer.drawRect(72, 14, 336, 14, '#3a0000');
    const ratio = Math.max(0, boss.unit.stats.health) / Math.max(1, boss.unit.stats.maxHealth);
    renderer.drawRect(72, 14, 336 * ratio, 14, '#d44949');
    renderer.drawText(`${boss.unit.name.toUpperCase()}  ${Math.ceil(boss.unit.stats.health)}/${boss.unit.stats.maxHealth}`, 240, 16, {
      color: '#ffffff',
      font: 'bold 9px "Courier New"',
      align: 'center',
    });
  }

  private renderFloatingTexts(renderer: Renderer, anchors: Map<string, Vector2>): void {
    this.presentation.getFloatingTexts().forEach(text => {
      const anchor = anchors.get(text.targetId);
      if (!anchor) return;

      const alpha = Math.max(0, text.life / text.maxLife);
      renderer.ctx.save();
      renderer.ctx.globalAlpha = alpha;
      renderer.drawText(text.text, anchor.x + text.offsetX, anchor.y + text.offsetY, {
        color: text.color,
        font: 'bold 10px "Courier New"',
        align: 'center',
      });
      if (text.emphasis) {
        renderer.drawText(text.emphasis, anchor.x + text.offsetX, anchor.y + text.offsetY - 10, {
          color: '#ffffff',
          font: '7px "Courier New"',
          align: 'center',
        });
      }
      renderer.ctx.restore();
    });
  }

  private renderStatusBar(renderer: Renderer): void {
    renderer.drawText('AUTO BATTLE ONLINE  •  WINDOWS-98 BATTLE MODULE  •  ESC TO RETURN AFTER COMBAT', 240, 263, {
      color: '#d5d5d5',
      font: '8px "Courier New"',
      align: 'center',
    });
  }

  private renderOverlayFlash(renderer: Renderer): void {
    const flash = this.presentation.getOverlayFlash();
    if (flash <= 0) return;
    renderer.ctx.fillStyle = `rgba(255,255,255,${flash})`;
    renderer.ctx.fillRect(0, 0, renderer.virtualWidth, renderer.virtualHeight);
  }

  private renderFinishOverlay(renderer: Renderer): void {
    Win98Theme.drawWindow(renderer, 146, 92, 188, 72, 'Encounter Result');
    const won = this.presentation.getBattleOutcome();
    renderer.drawText(won ? 'VICTORY' : 'DEFEAT', 240, 117, {
      color: won ? '#006400' : '#8b0000',
      font: 'bold 14px "Courier New"',
      align: 'center',
    });
    renderer.drawText('Press ESC to return.', 240, 138, {
      color: '#000000',
      font: '9px "MS Sans Serif", Arial',
      align: 'center',
    });
  }

  private renderPortraitExpression(
    renderer: Renderer,
    x: number,
    y: number,
    size: number,
    state: PresentationUnitState
  ): void {
    const ctx = renderer.ctx;
    const blink = state.animation === 'cast' || (state.animation === 'idle' && Math.sin(state.animationTime * 1.8) > 0.98);
    const mouthColor = state.animation === 'lowHealth' ? '#6d1111' : '#3a1f10';
    const eyeColor = state.animation === 'death' ? '#555555' : '#000000';
    const eyeY = y + size * 0.4;

    ctx.fillStyle = eyeColor;
    if (blink) {
      ctx.fillRect(x + size * 0.24, eyeY, size * 0.16, 1);
      ctx.fillRect(x + size * 0.6, eyeY, size * 0.16, 1);
    } else {
      ctx.fillRect(x + size * 0.25, eyeY - 1, 3, 3);
      ctx.fillRect(x + size * 0.62, eyeY - 1, 3, 3);
    }

    ctx.fillStyle = mouthColor;
    const mouthY = y + size * 0.7;
    const mouthWidth = state.animation === 'victory' ? size * 0.24 : state.animation === 'hit' ? size * 0.12 : size * 0.18;
    ctx.fillRect(x + size * 0.41, mouthY, mouthWidth, 2);

    if (state.animation === 'cast') {
      ctx.fillStyle = 'rgba(130, 180, 255, 0.35)';
      ctx.fillRect(x, y, size, size);
    }
    if (state.animation === 'death') {
      ctx.fillStyle = 'rgba(70,70,70,0.4)';
      ctx.fillRect(x, y, size, size);
    }
  }

  private renderBar(
    renderer: Renderer,
    x: number,
    y: number,
    width: number,
    height: number,
    value: number,
    max: number,
    background: string,
    fill: string,
    label: string
  ): void {
    Win98Theme.drawPanel(renderer, x, y, width, height, true);
    renderer.drawRect(x + 2, y + 2, width - 4, height - 4, background);
    const ratio = Math.max(0, Math.min(1, max <= 0 ? 0 : value / max));
    if (ratio > 0) {
      renderer.drawRect(x + 2, y + 2, (width - 4) * ratio, height - 4, fill);
    }
    renderer.drawText(label, x + width / 2, y + 1, {
      color: '#ffffff',
      font: '7px "Courier New"',
      align: 'center',
    });
  }

  private getPortraitArt(unit: Unit): HTMLCanvasElement {
    const key = `${unit.data.id}_${unit.data.rarity}_${unit.data.class}`;
    const existing = this.portraitCache.get(key);
    if (existing) return existing;

    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to create portrait placeholder canvas. Canvas 2D rendering may be unavailable in this browser environment.');
    }

    ctx.fillStyle = this.getRarityColor(unit.data.rarity);
    ctx.fillRect(0, 0, 40, 40);
    ctx.fillStyle = this.getClassColor(unit.data.class);
    ctx.fillRect(4, 4, 32, 32);
    ctx.fillStyle = '#f1d5b3';
    ctx.beginPath();
    ctx.arc(20, 18, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2f241b';
    ctx.fillRect(9, 7, 22, 6);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText(unit.name.charAt(0).toUpperCase(), 20, 33);

    this.portraitCache.set(key, canvas);
    return canvas;
  }

  private getEnemyArt(unit: Unit): HTMLCanvasElement {
    const key = `${unit.data.id}_${unit.data.rarity}_${unit.data.class}`;
    const existing = this.enemyCache.get(key);
    if (existing) return existing;

    const canvas = document.createElement('canvas');
    canvas.width = 72;
    canvas.height = 72;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to create enemy placeholder canvas. Canvas 2D rendering may be unavailable in this browser environment.');
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 72);
    gradient.addColorStop(0, this.getClassColor(unit.data.class));
    gradient.addColorStop(1, '#1b1b1b');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(36, 38, 20, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(26, 28, 6, 6);
    ctx.fillRect(40, 28, 6, 6);
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(29, 43, 14, 3);
    ctx.strokeStyle = this.getRarityColor(unit.data.rarity);
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 10, 56, 52);

    this.enemyCache.set(key, canvas);
    return canvas;
  }

  private getProjectileProgress(sourceWorld: Vector2, targetWorld: Vector2, currentWorld: Vector2): number {
    const total = sourceWorld.distanceTo(targetWorld);
    if (total <= 0) return 1;
    const current = Math.min(total, currentWorld.distanceTo(targetWorld));
    return Math.max(0, Math.min(1, 1 - current / total));
  }

  private isInside(point: Vector2, rect: Rect): boolean {
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    );
  }

  private getRarityColor(rarity: Unit['data']['rarity']): string {
    switch (rarity) {
      case 'legendary': return '#d9b300';
      case 'epic': return '#8a2be2';
      case 'rare': return '#4169e1';
      case 'uncommon': return '#3cb371';
      default: return '#a9a9a9';
    }
  }

  private getClassColor(unitClass: Unit['data']['class']): string {
    switch (unitClass) {
      case 'Tank': return '#5a6c7d';
      case 'Warrior': return '#8b4513';
      case 'Assassin': return '#4b0082';
      case 'Mage': return '#1e90ff';
      case 'Support': return '#2e8b57';
      case 'Ranger': return '#6b8e23';
      default: return '#696969';
    }
  }

  private getStatusColor(type: string): string {
    switch (type) {
      case 'burn': return '#ff4500';
      case 'poison': return '#32cd32';
      case 'freeze': return '#87ceeb';
      case 'stun': return '#ffd700';
      case 'bleed': return '#b22222';
      default: return '#808080';
    }
  }
}
