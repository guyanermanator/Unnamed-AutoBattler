import { StatusEffectType, StatusEffect as SharedStatusEffect } from '@unnamed-auto-battler/shared';

/**
 * Runtime status effect
 */
export class StatusEffect implements SharedStatusEffect {
  id: string;
  type: StatusEffectType;
  duration: number;
  stacks: number;
  tickDamage?: number;
  slowAmount?: number;
  source?: string;

  constructor(data: SharedStatusEffect) {
    this.id = data.id;
    this.type = data.type;
    this.duration = data.duration;
    this.stacks = data.stacks;
    this.tickDamage = data.tickDamage;
    this.slowAmount = data.slowAmount;
    this.source = data.source;
  }
}
