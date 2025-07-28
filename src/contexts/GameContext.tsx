"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useGameController } from "@/hooks/useGameController";
import { GameController } from "@/utils/gameController";

interface GameContextValue {
  gameState: ReturnType<typeof useGameController>;
}

const GameContext = createContext<GameContextValue | null>(null);

interface GameProviderProps {
  children: ReactNode;
  controller?: GameController;
}

export function GameProvider({ children, controller }: GameProviderProps) {
  const gameState = useGameController(controller);

  return (
    <GameContext.Provider value={{ gameState }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context.gameState;
}
