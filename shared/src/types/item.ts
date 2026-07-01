export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable';
export type ItemSlot = 'weapon' | 'head' | 'chest' | 'legs' | 'accessory1' | 'accessory2';

export interface ItemStats {
  health?: number;
  mana?: number;
  attackDamage?: number;
  magicDamage?: number;
  armor?: number;
  magicResist?: number;
  attackSpeed?: number;
  critChance?: number;
  critDamage?: number;
  movementSpeed?: number;
  lifesteal?: number;
  spellVamp?: number;
}

export interface ItemData {
  version: string;
  id: string;
  name: string;
  description: string;
  rarity: ItemRarity;
  type: ItemType;
  slot?: ItemSlot;
  stats?: ItemStats;
  value: number;
  icon?: string;
  maxStack?: number;
  consumable?: {
    effect: string;
    value: number;
  };
  ability?: string;
}
