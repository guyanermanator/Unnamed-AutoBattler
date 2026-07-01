/**
 * Save/load system for game state
 */
export interface SaveData {
  profile: {
    username: string;
    level: number;
    experience: number;
    gold: number;
    highestFloor: number;
    totalWins: number;
    totalLosses: number;
    unlockedUnits: string[];
    unlockedItems: string[];
  };
  currentRun?: {
    seed: number;
    floor: number;
    gold: number;
    team: string[];
    inventory: string[];
  };
}

export class SaveSystem {
  private static readonly SAVE_KEY = 'autobattler_save';

  /**
   * Save game data to localStorage
   */
  static save(data: SaveData): void {
    try {
      const json = JSON.stringify(data);
      localStorage.setItem(SaveSystem.SAVE_KEY, json);
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }

  /**
   * Load game data from localStorage
   */
  static load(): SaveData | null {
    try {
      const json = localStorage.getItem(SaveSystem.SAVE_KEY);
      if (!json) return null;
      return JSON.parse(json);
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  /**
   * Delete save data
   */
  static deleteSave(): void {
    localStorage.removeItem(SaveSystem.SAVE_KEY);
  }

  /**
   * Check if save exists
   */
  static hasSave(): boolean {
    return localStorage.getItem(SaveSystem.SAVE_KEY) !== null;
  }
}
