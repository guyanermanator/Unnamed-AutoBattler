export type AbilityTargetType = 'self' | 'ally' | 'enemy' | 'all_allies' | 'all_enemies' | 'area';
export type AbilityType = 'active' | 'passive';
export type DamageType = 'physical' | 'magical' | 'true';

export interface AbilityData {
  version: string;
  id: string;
  name: string;
  description: string;
  type: AbilityType;
  targetType: AbilityTargetType;
  manaCost: number;
  cooldown: number;
  castTime?: number;
  range?: number;
  radius?: number;
  damage?: {
    base: number;
    scaling: number;
    type: DamageType;
  };
  healing?: {
    base: number;
    scaling: number;
  };
  statusEffect?: {
    id: string;
    duration: number;
    stacks?: number;
  };
  projectile?: {
    speed: number;
    sprite?: string;
  };
  animation?: string;
  sound?: string;
  icon?: string;
}
