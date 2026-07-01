export interface UnitStats {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  manaRegen: number;
  attackDamage: number;
  magicDamage: number;
  armor: number;
  magicResist: number;
  attackSpeed: number;
  attackRange: number;
  critChance: number;
  critDamage?: number;
  movementSpeed: number;
}

export interface TargetingConfig {
  priority: 'closest' | 'furthest' | 'lowest_hp' | 'highest_hp' | 'random';
  aggroRadius: number;
}

export interface UnitAnimations {
  idle: string;
  walk: string;
  attack: string;
  cast: string;
  hit: string;
  death: string;
}

export type UnitRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type UnitClass = 'Tank' | 'Warrior' | 'Assassin' | 'Mage' | 'Support' | 'Ranger';
export type UnitFaction = 'Human' | 'Undead' | 'Beast' | 'Demon' | 'Elemental';

export interface UnitData {
  version: string;
  id: string;
  name: string;
  rarity: UnitRarity;
  cost: number;
  class: UnitClass;
  faction: UnitFaction;
  traits: string[];
  stats: UnitStats;
  targeting: TargetingConfig;
  ability?: string;
  passive?: string;
  animations: UnitAnimations;
  portrait?: string;
  sprite?: string;
  projectileSpeed?: number;
  sounds?: {
    attack?: string;
    cast?: string;
    death?: string;
  };
}
