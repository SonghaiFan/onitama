import { useState, useEffect, useCallback, useRef } from "react";
import {
  GameController,
  GameControllerState,
  GameControllerConfig,
  defaultGameController,
} from "@/utils/gameController";
import { Player, CardPack, AIPlayerConfig } from "@/types/game";

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

  const setAIPlayer = useCallback(async (player: Player, config: AIPlayerConfig | null) => {
    await controllerRef.current.setAIPlayer(player, config);
  }, []);

  const setAIvsAI = useCallback(async (redConfig: AIPlayerConfig, blueConfig: AIPlayerConfig) => {
    await controllerRef.current.setAIvsAI(redConfig, blueConfig);
  }, []);

  const setHumanvsHuman = useCallback(async () => {
    await controllerRef.current.setHumanvsHuman();
  }, []);

  const updateAIConfig = useCallback(
    (config: Partial<GameControllerConfig>) => {
      controllerRef.current.updateAIConfig(config);
    },
    []
  );

  const resetGame = useCallback(async (cardPacks: CardPack[] = ["normal"]) => {
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

  // New AI control methods
  const setAIAutoMode = useCallback((enabled: boolean) => {
    controllerRef.current.setAIAutoMode(enabled);
  }, []);

  const setAIMoveDelay = useCallback((delay: number) => {
    controllerRef.current.setAIMoveDelay(delay);
  }, []);

  const triggerAIMove = useCallback(async () => {
    await controllerRef.current.triggerAIMove();
  }, []);

  const startAIvsAI = useCallback(async () => {
    await controllerRef.current.startAIvsAI();
  }, []);

  const stopAIvsAI = useCallback(() => {
    controllerRef.current.stopAIvsAI();
  }, []);

  const resetGameForAIvsAI = useCallback(async (cardPacks: CardPack[] = ["normal"]) => {
    await controllerRef.current.resetGameForAIvsAI(cardPacks);
  }, []);

  // Initialize game on mount
  useEffect(() => {
    controllerRef.current.init(["normal"]);
  }, []);

  return {
    // State
    gameState: state.gameState,
    isLoading: state.isLoading,
    isAITurn: state.isAITurn,
    aiPlayers: state.aiPlayers,
    config: state.config,
    // New AI control state
    isAIAutoMode: state.isAIAutoMode,
    isAIvsAIRunning: state.isAIvsAIRunning,
    aiMoveDelay: state.aiMoveDelay,

    // Actions
    selectPiece,
    selectCard,
    executeMove,
    setAIPlayer,
    setAIvsAI,
    setHumanvsHuman,
    updateAIConfig,
    resetGame,
    getPossibleMoves,
    isValidMove,
    // New AI control actions
    setAIAutoMode,
    setAIMoveDelay,
    triggerAIMove,
    startAIvsAI,
    stopAIvsAI,
    resetGameForAIvsAI,

    // Controller reference for advanced usage
    controller: controllerRef.current,
  };
}
