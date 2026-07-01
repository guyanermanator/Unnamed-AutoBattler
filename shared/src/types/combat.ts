import { UnitData } from './unit.js';

export type StatusEffectType = 
  | 'burn' 
  | 'poison' 
  | 'freeze' 
  | 'slow' 
  | 'silence' 
  | 'stun' 
  | 'bleed' 
  | 'fear' 
  | 'taunt' 
  | 'root';

export interface StatusEffect {
  id: string;
  type: StatusEffectType;
  duration: number;
  stacks: number;
  tickDamage?: number;
  slowAmount?: number;
  source?: string;
}

export interface CombatState {
  allies: UnitData[];
  enemies: UnitData[];
  seed: number;
  round: number;
  timeElapsed: number;
}

export interface CombatResult {
  won: boolean;
  allies: UnitData[];
  enemies: UnitData[];
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalHealing: number;
  unitsLost: number;
  duration: number;
}

export interface DamageEvent {
  source: string;
  target: string;
  amount: number;
  type: 'physical' | 'magical' | 'true';
  isCrit: boolean;
}

export interface HealEvent {
  source: string;
  target: string;
  amount: number;
}
