import { eventBus, type EventCallback, type GameEvents } from '../../engine/events/EventBus';
import { Vector2 } from '../../engine/math/Vector2';
import { Projectile } from './Projectile';
import { Unit } from '../units/Unit';

type AnimationName =
  | 'idle'
  | 'attack'
  | 'cast'
  | 'hit'
  | 'lowHealth'
  | 'death'
  | 'victory'
  | 'defeat';

interface AnimationRequest {
  name: Exclude<AnimationName, 'idle' | 'lowHealth'>;
  remaining: number;
  priority: number;
}

class AnimationController {
  private time = 0;
  private current: AnimationRequest | null = null;

  update(dt: number): void {
    this.time += dt;
    if (!this.current) return;
    this.current.remaining -= dt;
    if (this.current.remaining <= 0) {
      this.current = null;
    }
  }

  trigger(name: AnimationRequest['name'], duration: number, priority: number): void {
    if (!this.current || priority >= this.current.priority) {
      this.current = { name, remaining: duration, priority };
    }
  }

  getState(isAlive: boolean, isLowHealth: boolean, won: boolean | null): AnimationName {
    if (!isAlive) return 'death';
    if (this.current) return this.current.name;
    if (won === true) return 'victory';
    if (won === false) return 'defeat';
    if (isLowHealth) return 'lowHealth';
    return 'idle';
  }

  getTime(): number {
    return this.time;
  }
}

export interface FloatingText {
  id: string;
  targetId: string;
  text: string;
  color: string;
  emphasis?: string;
  life: number;
  maxLife: number;
  offsetX: number;
  offsetY: number;
}

export interface CombatLogEntry {
  id: string;
  text: string;
  emphasis?: 'crit' | 'system' | 'status';
}

export interface PresentationUnitState {
  unit: Unit;
  animation: AnimationName;
  animationTime: number;
  highlight: number;
  targetPulse: number;
  flash: number;
  bobOffset: number;
}

export interface EnemyPresentationState extends PresentationUnitState {
  position: Vector2;
  scale: number;
  row: 'front' | 'back' | 'flying';
  isBoss: boolean;
}

export interface ProjectileTrail {
  id: string;
  from: Vector2;
  to: Vector2;
}

const MAX_LOG_ENTRIES = 24;

export class CombatPresentation {
  private allies: Unit[] = [];
  private enemies: Unit[] = [];
  private animations = new Map<string, AnimationController>();
  private highlights = new Map<string, number>();
  private targetPulses = new Map<string, number>();
  private flashes = new Map<string, number>();
  private floatingTexts: FloatingText[] = [];
  private combatLog: CombatLogEntry[] = [];
  private unsubscribers: Array<() => void> = [];
  private shakeTimer = 0;
  private shakeMagnitude = 0;
  private shakeOffset = Vector2.zero;
  private overlayFlash = 0;
  private battleOutcome: boolean | null = null;
  private logCollapsed = true;

  bind(allies: Unit[], enemies: Unit[]): void {
    this.destroy();
    this.allies = allies;
    this.enemies = enemies;
    this.animations.clear();
    this.highlights.clear();
    this.targetPulses.clear();
    this.flashes.clear();
    this.floatingTexts = [];
    this.combatLog = [];
    this.battleOutcome = null;
    this.shakeTimer = 0;
    this.shakeMagnitude = 0;
    this.shakeOffset = Vector2.zero;
    this.overlayFlash = 0;

    [...allies, ...enemies].forEach(unit => {
      this.animations.set(unit.id, new AnimationController());
    });

    this.subscribe('UnitTargeted', ({ sourceId, targetId }) => {
      this.highlights.set(sourceId, 0.45);
      this.targetPulses.set(targetId, 0.55);
      this.appendLog(`${this.getUnitName(sourceId)} targets ${this.getUnitName(targetId)}.`);
    });

    this.subscribe('UnitAttacked', ({ sourceId, targetId, isCrit, isRanged }) => {
      this.animations.get(sourceId)?.trigger('attack', 0.28, 2);
      this.highlights.set(sourceId, 0.35);
      this.targetPulses.set(targetId, 0.45);
      const attackVerb = isRanged ? 'fires at' : 'strikes';
      this.appendLog(`${this.getUnitName(sourceId)} ${attackVerb} ${this.getUnitName(targetId)}${isCrit ? '!' : '.'}`, isCrit ? 'crit' : undefined);
    });

    this.subscribe('ProjectileSpawned', ({ from, to }) => {
      this.highlights.set(from, 0.3);
      this.targetPulses.set(to, 0.3);
    });

    this.subscribe('ProjectileHit', ({ target, damage }) => {
      this.pushDamageText(target, Math.round(damage), false);
    });

    this.subscribe('UnitDamaged', ({ unitId, damage }) => {
      this.animations.get(unitId)?.trigger('hit', 0.35, 3);
      this.flashes.set(unitId, 0.45);
      this.startShake(0.22, 5);
      this.overlayFlash = 0.15;
      this.pushDamageText(unitId, Math.round(damage), true);
    });

    this.subscribe('UnitHealed', ({ unitId, amount }) => {
      this.animations.get(unitId)?.trigger('cast', 0.4, 2);
      this.pushFloatingText(unitId, `+${Math.round(amount)}`, '#7CFC9D', 'HEAL');
      this.appendLog(`${this.getUnitName(unitId)} recovers ${Math.round(amount)} HP.`, 'status');
    });

    this.subscribe('AbilityCast', ({ unitId, abilityId, target }) => {
      this.animations.get(unitId)?.trigger('cast', 0.5, 2);
      if (target) {
        this.targetPulses.set(target, 0.4);
      }
      this.appendLog(`${this.getUnitName(unitId)} casts ${abilityId}.`, 'system');
    });

    this.subscribe('UnitDied', ({ unitId, killedBy }) => {
      this.animations.get(unitId)?.trigger('death', 99, 10);
      this.flashes.set(unitId, 0.8);
      this.startShake(0.3, 7);
      this.appendLog(`${this.getUnitName(unitId)} falls${killedBy ? ` to ${this.getUnitName(killedBy)}` : ''}.`, 'system');
    });

    this.subscribe('BattleFinished', ({ won }) => {
      this.battleOutcome = won;
      this.overlayFlash = 0.35;
      this.appendLog(won ? 'Victory!' : 'Defeat.', 'system');
      this.allies.forEach(unit => {
        if (unit.stats.isAlive()) {
          this.animations.get(unit.id)?.trigger(won ? 'victory' : 'defeat', 1.2, 4);
        }
      });
      this.enemies.forEach(unit => {
        if (unit.stats.isAlive()) {
          this.animations.get(unit.id)?.trigger(won ? 'defeat' : 'victory', 1.2, 4);
        }
      });
    });
  }

  destroy(): void {
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.unsubscribers = [];
  }

  update(dt: number): void {
    this.animations.forEach(controller => controller.update(dt));

    this.decayMap(this.highlights, dt);
    this.decayMap(this.targetPulses, dt);
    this.decayMap(this.flashes, dt * 1.5);

    this.floatingTexts = this.floatingTexts
      .map(text => ({
        ...text,
        life: text.life - dt,
        offsetY: text.offsetY - dt * 20,
      }))
      .filter(text => text.life > 0);

    this.overlayFlash = Math.max(0, this.overlayFlash - dt * 1.5);
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const intensity = Math.max(0, this.shakeTimer) * this.shakeMagnitude * 5;
      this.shakeOffset = new Vector2(
        Math.sin(Date.now() * 0.05) * intensity,
        Math.cos(Date.now() * 0.04) * intensity
      );
    } else {
      this.shakeOffset = Vector2.zero;
    }
  }

  getPartyStates(): PresentationUnitState[] {
    return this.allies.map(unit => this.createUnitState(unit));
  }

  getEnemyStates(): EnemyPresentationState[] {
    const aliveEnemies = this.enemies.filter(unit => unit.stats.isAlive());
    const total = aliveEnemies.length;

    return this.enemies.map((unit, index) => {
      const state = this.createUnitState(unit);
      const isBoss = total === 1 || unit.data.rarity === 'legendary' || unit.data.rarity === 'epic';
      const row = unit.stats.attackRange > 3 ? 'back' : 'front';
      const flying = unit.data.class === 'Mage' && total > 2;
      const y = flying ? 78 : row === 'back' ? 92 : 118;
      const spacing = total <= 1 ? 0 : 180 / Math.max(1, total - 1);
      const x = 150 + spacing * index;
      const scale = isBoss ? 1.55 : row === 'back' ? 0.95 : 1.12;

      return {
        ...state,
        position: new Vector2(x, y + state.bobOffset),
        scale,
        row: flying ? 'flying' : row,
        isBoss,
      };
    });
  }

  getProjectileTrails(projectiles: Projectile[]): ProjectileTrail[] {
    return projectiles.map(projectile => ({
      id: projectile.id,
      from: projectile.source.transform.position.clone(),
      to: projectile.position.clone(),
    }));
  }

  getFloatingTexts(): FloatingText[] {
    return this.floatingTexts;
  }

  getCombatLog(): CombatLogEntry[] {
    return this.combatLog;
  }

  isLogCollapsed(): boolean {
    return this.logCollapsed;
  }

  toggleCombatLog(): void {
    this.logCollapsed = !this.logCollapsed;
  }

  setLogCollapsed(collapsed: boolean): void {
    this.logCollapsed = collapsed;
  }

  getShakeOffset(): Vector2 {
    return this.shakeOffset;
  }

  getOverlayFlash(): number {
    return this.overlayFlash;
  }

  getBattleOutcome(): boolean | null {
    return this.battleOutcome;
  }

  private createUnitState(unit: Unit): PresentationUnitState {
    const controller = this.animations.get(unit.id) ?? new AnimationController();
    const lowHealth = unit.stats.health / Math.max(1, unit.stats.maxHealth) <= 0.3;
    const animation = controller.getState(unit.stats.isAlive(), lowHealth, this.battleOutcome);
    const time = controller.getTime();
    const bobStrength = animation === 'attack' ? 1.5 : animation === 'cast' ? 2.5 : 1;

    return {
      unit,
      animation,
      animationTime: time,
      highlight: this.highlights.get(unit.id) ?? 0,
      targetPulse: this.targetPulses.get(unit.id) ?? 0,
      flash: this.flashes.get(unit.id) ?? 0,
      bobOffset: Math.sin(time * 4 + unit.id.length) * bobStrength,
    };
  }

  private pushDamageText(unitId: string, damage: number, includeImpactLabel: boolean): void {
    this.pushFloatingText(unitId, `-${damage}`, '#FFD166', includeImpactLabel ? 'HIT' : undefined);
  }

  private pushFloatingText(unitId: string, text: string, color: string, emphasis?: string): void {
    this.floatingTexts.push({
      id: `${unitId}_${Date.now()}_${Math.random()}`,
      targetId: unitId,
      text,
      color,
      emphasis,
      life: 0.9,
      maxLife: 0.9,
      offsetX: (Math.random() - 0.5) * 10,
      offsetY: -8,
    });
  }

  private appendLog(text: string, emphasis?: CombatLogEntry['emphasis']): void {
    this.combatLog.unshift({
      id: `${Date.now()}_${Math.random()}`,
      text,
      emphasis,
    });
    if (this.combatLog.length > MAX_LOG_ENTRIES) {
      this.combatLog.length = MAX_LOG_ENTRIES;
    }
  }

  private decayMap(map: Map<string, number>, amount: number): void {
    map.forEach((value, key) => {
      const nextValue = Math.max(0, value - amount);
      if (nextValue <= 0) {
        map.delete(key);
      } else {
        map.set(key, nextValue);
      }
    });
  }

  private startShake(duration: number, magnitude: number): void {
    this.shakeTimer = Math.max(this.shakeTimer, duration);
    this.shakeMagnitude = Math.max(this.shakeMagnitude, magnitude);
  }

  private subscribe<K extends keyof GameEvents>(
    event: K,
    callback: EventCallback<GameEvents[K]>
  ): void {
    this.unsubscribers.push(eventBus.on(event, callback));
  }

  private getUnitName(unitId: string): string {
    return [...this.allies, ...this.enemies].find(unit => unit.id === unitId)?.name ?? 'Unknown';
  }
}
