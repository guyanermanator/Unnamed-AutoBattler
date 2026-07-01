/**
 * Type-safe event bus for game-wide communication
 */

export type EventCallback<T = any> = (data: T) => void;

export interface GameEvents {
  // Unit events
  UnitDied: { unitId: string; killedBy?: string };
  UnitSpawned: { unitId: string; position: { x: number; y: number } };
  UnitDamaged: { unitId: string; damage: number; source?: string };
  UnitHealed: { unitId: string; amount: number; source?: string };
  
  // Combat events
  BattleStarted: { seed: number };
  BattleFinished: { won: boolean; duration: number };
  AbilityCast: { unitId: string; abilityId: string; target?: string };
  ProjectileSpawned: { id: string; from: string; to: string };
  ProjectileHit: { id: string; target: string; damage: number };
  
  // Item events
  ItemEquipped: { unitId: string; itemId: string; slot: string };
  ItemUnequipped: { unitId: string; itemId: string; slot: string };
  ItemUsed: { unitId: string; itemId: string };
  
  // Progression events
  PlayerLeveledUp: { level: number };
  GoldEarned: { amount: number };
  ExperienceGained: { amount: number };
  
  // Dungeon events
  NodeCompleted: { nodeId: string; type: string };
  TreasureOpened: { items: string[] };
  ShopRefreshed: { items: string[] };
  
  // UI events
  ChatMessageReceived: { userId: string; message: string };
  SettingsChanged: { setting: string; value: any };
  ProfileUpdated: { userId: string };
}

export class EventBus {
  private listeners: Map<keyof GameEvents, Set<EventCallback>> = new Map();

  /**
   * Subscribe to an event
   */
  on<K extends keyof GameEvents>(event: K, callback: EventCallback<GameEvents[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Subscribe to an event once
   */
  once<K extends keyof GameEvents>(event: K, callback: EventCallback<GameEvents[K]>): void {
    const wrappedCallback = (data: GameEvents[K]) => {
      callback(data);
      this.off(event, wrappedCallback);
    };
    this.on(event, wrappedCallback);
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends keyof GameEvents>(event: K, callback: EventCallback<GameEvents[K]>): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Emit an event
   */
  emit<K extends keyof GameEvents>(event: K, data: GameEvents[K]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for ${String(event)}:`, error);
        }
      });
    }
  }

  /**
   * Clear all listeners for an event
   */
  clear<K extends keyof GameEvents>(event?: K): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount<K extends keyof GameEvents>(event: K): number {
    return this.listeners.get(event)?.size || 0;
  }
}

// Global event bus instance
export const eventBus = new EventBus();
