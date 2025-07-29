import { GameState, Player } from "@/types/game";
import { GameControllerConfig } from "./gameController";

interface SavedGameState {
  gameState: GameState;
  timestamp: number;
  cardPacks: string[];
  aiConfig: GameControllerConfig;
  aiPlayer: Player | null;
}

interface UserPreferences {
  language: "zh" | "en";
  soundEnabled: boolean;
  musicEnabled: boolean;
  defaultCardPacks: string[];
  defaultAIConfig: GameControllerConfig;
}

const STORAGE_KEYS = {
  SAVED_GAME: "onitama_saved_game",
  PREFERENCES: "onitama_preferences",
  GAME_HISTORY: "onitama_game_history",
} as const;

/**
 * Game persistence utilities
 */
export class GamePersistence {
  /**
   * Save current game state
   */
  static saveGame(
    gameState: GameState,
    cardPacks: string[],
    aiConfig: GameControllerConfig,
    aiPlayer: Player | null
  ): void {
    try {
      const savedState: SavedGameState = {
        gameState,
        timestamp: Date.now(),
        cardPacks,
        aiConfig,
        aiPlayer,
      };

      localStorage.setItem(STORAGE_KEYS.SAVED_GAME, JSON.stringify(savedState));
    } catch (error) {
      console.error("Failed to save game:", error);
    }
  }

  /**
   * Load saved game state
   */
  static loadGame(): SavedGameState | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_GAME);
      if (!saved) return null;

      const parsed = JSON.parse(saved) as SavedGameState;

      // Validate the saved state
      if (!parsed.gameState || !parsed.timestamp) {
        console.warn("Invalid saved game state");
        return null;
      }

      // Check if saved game is too old (24 hours)
      const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000;
      if (isExpired) {
        console.log("Saved game expired, removing");
        this.clearSavedGame();
        return null;
      }

      return parsed;
    } catch (error) {
      console.error("Failed to load saved game:", error);
      return null;
    }
  }

  /**
   * Clear saved game
   */
  static clearSavedGame(): void {
    localStorage.removeItem(STORAGE_KEYS.SAVED_GAME);
  }

  /**
   * Save user preferences
   */
  static savePreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  }

  /**
   * Load user preferences
   */
  static loadPreferences(): UserPreferences {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (!saved) return this.getDefaultPreferences();

      const parsed = JSON.parse(saved) as UserPreferences;
      return { ...this.getDefaultPreferences(), ...parsed };
    } catch (error) {
      console.error("Failed to load preferences:", error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Get default preferences
   */
  static getDefaultPreferences(): UserPreferences {
    return {
      language: "zh",
      soundEnabled: true,
      musicEnabled: true,
      defaultCardPacks: ["normal"],
      defaultAIConfig: {
        aiAlgorithm: "hybrid-montecarlo",
        aiThinkingTime: 1000,
      },
    };
  }

  /**
   * Add game to history
   */
  static addToHistory(gameResult: {
    winner: Player | null;
    duration: number;
    cardPacks: string[];
    aiPlayer: Player | null;
    aiDifficulty: string;
  }): void {
    try {
      const history = this.getGameHistory();
      const gameRecord = {
        ...gameResult,
        timestamp: Date.now(),
        id: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      history.unshift(gameRecord);

      // Keep only last 50 games
      if (history.length > 50) {
        history.splice(50);
      }

      localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save game history:", error);
    }
  }

  /**
   * Get game history
   */
  static getGameHistory(): unknown[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to load game history:", error);
      return [];
    }
  }

  /**
   * Clear game history
   */
  static clearGameHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.GAME_HISTORY);
  }

  /**
   * Export game data
   */
  static exportGameData(): string {
    try {
      const data = {
        savedGame: this.loadGame(),
        preferences: this.loadPreferences(),
        history: this.getGameHistory(),
        exportTimestamp: Date.now(),
        version: "1.0.0",
      };

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("Failed to export game data:", error);
      return "";
    }
  }

  /**
   * Import game data
   */
  static importGameData(dataString: string): boolean {
    try {
      const data = JSON.parse(dataString);

      if (data.savedGame) {
        localStorage.setItem(
          STORAGE_KEYS.SAVED_GAME,
          JSON.stringify(data.savedGame)
        );
      }

      if (data.preferences) {
        localStorage.setItem(
          STORAGE_KEYS.PREFERENCES,
          JSON.stringify(data.preferences)
        );
      }

      if (data.history) {
        localStorage.setItem(
          STORAGE_KEYS.GAME_HISTORY,
          JSON.stringify(data.history)
        );
      }

      return true;
    } catch (error) {
      console.error("Failed to import game data:", error);
      return false;
    }
  }

  /**
   * Check if storage is available
   */
  static isStorageAvailable(): boolean {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}
