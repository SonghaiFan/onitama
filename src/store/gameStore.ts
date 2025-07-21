import { create } from "zustand";
import { GameState } from "@/types/game";
import { INITIAL_GAME_STATE } from "@/utils/gameLogic";

export type GameMode = "classic" | "blitz" | "custom";
export type AppScreen = "landing" | "game" | "settings" | "gameSelect";

interface GameSettings {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  theme: "default" | "zen" | "neon";
  difficulty: "easy" | "medium" | "hard";
}

interface AppState {
  // App Navigation
  currentScreen: AppScreen;
  setCurrentScreen: (screen: AppScreen) => void;

  // Game State
  gameState: GameState;
  setGameState: (gameState: GameState) => void;
  resetGame: () => void;

  // Game Mode
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;

  // Settings
  settings: GameSettings;
  updateSettings: (settings: Partial<GameSettings>) => void;

  // Menu State
  isMenuOpen: boolean;
  toggleMenu: () => void;

  // UI State
  showInstructions: boolean;
  toggleInstructions: () => void;
  showGameStatus: boolean;
  toggleGameStatus: () => void;
}

const defaultSettings: GameSettings = {
  soundEnabled: true,
  animationsEnabled: true,
  theme: "default",
  difficulty: "medium",
};

export const useGameStore = create<AppState>((set, get) => ({
  // App Navigation
  currentScreen: "landing",
  setCurrentScreen: (screen) => set({ currentScreen: screen }),

  // Game State
  gameState: INITIAL_GAME_STATE,
  setGameState: (gameState) => set({ gameState }),
  resetGame: () => set({ gameState: INITIAL_GAME_STATE }),

  // Game Mode
  gameMode: "classic",
  setGameMode: (mode) => set({ gameMode: mode }),

  // Settings
  settings: defaultSettings,
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  // Menu State
  isMenuOpen: false,
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),

  // UI State
  showInstructions: false,
  toggleInstructions: () =>
    set((state) => ({ showInstructions: !state.showInstructions })),
  showGameStatus: false,
  toggleGameStatus: () =>
    set((state) => ({ showGameStatus: !state.showGameStatus })),
}));
