"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useGameController } from "@/hooks/useGameController";
import { GameController } from "@/utils/gameController";
import { CardPack } from "@/types/game";

interface GameContextValue {
  gameState: ReturnType<typeof useGameController>;
}

const GameContext = createContext<GameContextValue | null>(null);

interface GameProviderProps {
  children: ReactNode;
  controller?: GameController;
  cardPacks?: CardPack[];
}

export function GameProvider({
  children,
  controller,
  cardPacks,
}: GameProviderProps) {
  const gameState = useGameController(controller, cardPacks);

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
