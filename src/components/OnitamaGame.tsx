"use client";

import React, {
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import GameBoard from "./GameBoard";
import MoveCards from "./MoveCards";
import { GameState, Player } from "@/types/game";
import {
  INITIAL_GAME_STATE,
  isValidMove,
  executeMove,
  createNewGameAsync,
} from "@/utils/gameLogic";

interface OnitamaGameProps {
  cardPack?: "normal" | "senseis";
}

const OnitamaGame = forwardRef<{ resetGame: () => void }, OnitamaGameProps>(
  function OnitamaGame({ cardPack = "normal" }, ref) {
    const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
    const [isLoading, setIsLoading] = useState(true);

    // Load the appropriate card pack when component mounts or cardPack changes
    useEffect(() => {
      const loadGame = async () => {
        setIsLoading(true);
        try {
          const newGameState = await createNewGameAsync(cardPack);
          setGameState(newGameState);
        } catch (error) {
          console.error("Failed to load card pack:", error);
          // Fallback to normal game state
          setGameState(INITIAL_GAME_STATE);
        } finally {
          setIsLoading(false);
        }
      };

      loadGame();
    }, [cardPack]);

    const handlePieceClick = useCallback(
      (position: [number, number]) => {
        if (gameState.winner) return;

        const [row, col] = position;
        const piece = gameState.board[row][col];

        if (
          !piece &&
          gameState.selectedPiece &&
          gameState.selectedCard !== null
        ) {
          const selectedCard =
            gameState.players[gameState.currentPlayer].cards[
              gameState.selectedCard
            ];
          if (
            isValidMove(
              gameState.selectedPiece,
              position,
              selectedCard,
              gameState.board
            )
          ) {
            const newGameState = executeMove(
              gameState,
              gameState.selectedPiece,
              position,
              gameState.selectedCard
            );
            setGameState(newGameState);
          }
          return;
        }

        if (piece) {
          if (piece.player === gameState.currentPlayer) {
            const newGameState = { ...gameState, selectedPiece: position };
            setGameState(newGameState);
          } else if (
            gameState.selectedPiece &&
            gameState.selectedCard !== null
          ) {
            const selectedCard =
              gameState.players[gameState.currentPlayer].cards[
                gameState.selectedCard
              ];
            if (
              isValidMove(
                gameState.selectedPiece,
                position,
                selectedCard,
                gameState.board
              )
            ) {
              const newGameState = executeMove(
                gameState,
                gameState.selectedPiece,
                position,
                gameState.selectedCard
              );
              setGameState(newGameState);
            }
          }
        } else {
          setGameState({
            ...gameState,
            selectedPiece: null,
            selectedCard: null,
          });
        }
      },
      [gameState]
    );

    const handleCardClick = useCallback(
      (cardIndex: number, player: Player) => {
        if (gameState.winner) return;
        if (player !== gameState.currentPlayer) return;

        const newGameState = { ...gameState, selectedCard: cardIndex };
        setGameState(newGameState);
      },
      [gameState]
    );

    const handleCardSelect = useCallback(
      (cardIndex: number) => {
        if (gameState.winner) return;

        const newGameState = { ...gameState, selectedCard: cardIndex };
        setGameState(newGameState);
      },
      [gameState]
    );

    const handlePieceMove = useCallback(
      (from: [number, number], to: [number, number], cardIndex: number) => {
        if (gameState.winner) return;

        const selectedCard =
          gameState.players[gameState.currentPlayer].cards[cardIndex];

        if (isValidMove(from, to, selectedCard, gameState.board)) {
          const newGameState = executeMove(gameState, from, to, cardIndex);
          setGameState(newGameState);
        }
      },
      [gameState]
    );

    const resetGame = useCallback(async () => {
      setIsLoading(true);
      try {
        const newGameState = await createNewGameAsync(cardPack);
        setGameState(newGameState);
      } catch (error) {
        console.error("Failed to reset game:", error);
        setGameState(INITIAL_GAME_STATE);
      } finally {
        setIsLoading(false);
      }
    }, [cardPack]);

    useImperativeHandle(ref, () => ({
      resetGame,
    }));

    // The old 'staticCards' and 'cards' useMemo hooks are no longer needed and have been removed.

    const GameStatusSimple = () => (
      <div className="flex items-center justify-center space-x-8 mb-6">
        {gameState.winner ? (
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🏆</div>
            <span
              className={`text-xl font-medium zen-text ${
                gameState.winner === "red" ? "text-red-600" : "text-blue-600"
              }`}
            >
              {gameState.winner === "red" ? "紅方" : "藍方"}勝利！
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-2">
              <span className="text-stone-600 font-light zen-text">
                當前回合:
              </span>
              <div
                className={`w-6 h-6 rounded-full animate-pulse shadow-lg ${
                  gameState.currentPlayer === "red"
                    ? "bg-red-600 shadow-red-300"
                    : "bg-blue-600 shadow-blue-300"
                }`}
              ></div>
              <span
                className={`font-bold text-lg zen-text ${
                  gameState.currentPlayer === "red"
                    ? "text-red-600"
                    : "text-blue-600"
                }`}
              >
                {gameState.currentPlayer === "red" ? "紅方" : "藍方"}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-stone-500 zen-text">
              {gameState.selectedPiece && (
                <div className="flex items-center space-x-1">
                  <span>已選棋子:</span>
                  <span className="font-mono bg-stone-100 px-2 py-1 rounded">
                    ({gameState.selectedPiece[0]}, {gameState.selectedPiece[1]})
                  </span>
                </div>
              )}
              {gameState.selectedCard !== null && (
                <div className="flex items-center space-x-1">
                  <span>已選卡牌:</span>
                  <span className="font-mono bg-stone-100 px-2 py-1 rounded">
                    #{gameState.selectedCard + 1}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
            <p className="text-stone-600 font-light">載入卡牌包...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full watercolor-wash">
        <GameStatusSimple />

        <div className="game-layout-grid">
          <div style={{ gridArea: "board" }}>
            <GameBoard
              gameState={gameState}
              onPieceClick={handlePieceClick}
              onCardSelect={handleCardSelect}
              onPieceMove={handlePieceMove}
            />
          </div>

          {/* CORRECTED: Passing the correct props to MoveCards */}
          <MoveCards
            redCards={gameState.players.red.cards}
            blueCards={gameState.players.blue.cards}
            sharedCard={gameState.sharedCard}
            currentPlayer={gameState.currentPlayer}
            selectedCardIndex={gameState.selectedCard}
            onCardClick={handleCardClick}
          />
        </div>
      </div>
    );
  }
);

export default OnitamaGame;
