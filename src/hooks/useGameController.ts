import { useState, useEffect, useCallback, useRef } from "react";
import {
  GameController,
  GameControllerState,
  GameControllerConfig,
  defaultGameController,
} from "@/utils/gameController";
import { Player } from "@/types/game";

/**
 * Custom hook for managing game state through the game controller
 */
export function useGameController(
  controller: GameController = defaultGameController
) {
  const [state, setState] = useState<GameControllerState>(
    controller.getState()
  );
  const controllerRef = useRef(controller);

  // Subscribe to controller state changes
  useEffect(() => {
    const unsubscribe = controllerRef.current.subscribe(setState);
    return unsubscribe;
  }, []);

  // Game actions
  const selectPiece = useCallback((position: [number, number]) => {
    controllerRef.current.selectPiece(position);
  }, []);

  const selectCard = useCallback((cardIndex: number, player: Player) => {
    controllerRef.current.selectCard(cardIndex, player);
  }, []);

  const executeMove = useCallback(
    (from: [number, number], to: [number, number], cardIndex: number) => {
      controllerRef.current.executeMove(from, to, cardIndex);
    },
    []
  );

  const setAIPlayer = useCallback((player: Player | null) => {
    controllerRef.current.setAIPlayer(player);
  }, []);

  const updateAIConfig = useCallback(
    (config: Partial<GameControllerConfig>) => {
      controllerRef.current.updateAIConfig(config);
    },
    []
  );

  const resetGame = useCallback(async (cardPacks: string[] = ["normal"]) => {
    await controllerRef.current.resetGame(cardPacks);
  }, []);

  const getPossibleMoves = useCallback(() => {
    return controllerRef.current.getPossibleMoves();
  }, []);

  const isValidMove = useCallback(
    (from: [number, number], to: [number, number], cardIndex: number) => {
      return controllerRef.current.isValidMove(from, to, cardIndex);
    },
    []
  );

  // Initialize game on mount
  useEffect(() => {
    controllerRef.current.init(["normal"]);
  }, []);

  return {
    // State
    gameState: state.gameState,
    isLoading: state.isLoading,
    isAITurn: state.isAITurn,
    aiPlayer: state.aiPlayer,
    config: state.config,

    // Actions
    selectPiece,
    selectCard,
    executeMove,
    setAIPlayer,
    updateAIConfig,
    resetGame,
    getPossibleMoves,
    isValidMove,

    // Controller reference for advanced usage
    controller: controllerRef.current,
  };
}
