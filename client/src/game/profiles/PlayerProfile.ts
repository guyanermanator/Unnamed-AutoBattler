/**
 * Player profile/progression
 */
export class PlayerProfile {
  username: string;
  level: number;
  experience: number;
  gold: number;
  highestFloor: number;
  totalWins: number;
  totalLosses: number;
  unlockedUnits: Set<string>;
  unlockedItems: Set<string>;

  constructor(username: string = 'Player') {
    this.username = username;
    this.level = 1;
    this.experience = 0;
    this.gold = 100;
    this.highestFloor = 0;
    this.totalWins = 0;
    this.totalLosses = 0;
    this.unlockedUnits = new Set(['unit_knight', 'unit_archer', 'unit_mage']);
    this.unlockedItems = new Set(['item_iron_sword', 'item_leather_armor']);
  }

  /**
   * Gain experience
   */
  gainExperience(amount: number): void {
    this.experience += amount;
    const xpForNextLevel = this.level * 100;

    if (this.experience >= xpForNextLevel) {
      this.levelUp();
    }
  }

  /**
   * Level up
   */
  private levelUp(): void {
    this.level++;
    this.experience = 0;
    this.gold += 50;
  }

  /**
   * Gain gold
   */
  gainGold(amount: number): void {
    this.gold += amount;
  }

  /**
   * Spend gold
   */
  spendGold(amount: number): boolean {
    if (this.gold >= amount) {
      this.gold -= amount;
      return true;
    }
    return false;
  }

  /**
   * Unlock a unit
   */
  unlockUnit(unitId: string): void {
    this.unlockedUnits.add(unitId);
  }

  /**
   * Unlock an item
   */
  unlockItem(itemId: string): void {
    this.unlockedItems.add(itemId);
  }
}
