"use client";

import React, {
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import GameBoard from "./GameBoard";
import MoveCards from "./MoveCards";
import { GameState, Player } from "@/types/game";
import {
  INITIAL_GAME_STATE,
  isValidMove,
  executeMove,
  createNewGame,
} from "@/utils/gameLogic";

const OnitamaGame = forwardRef<{ resetGame: () => void }, object>(
  function OnitamaGame(props, ref) {
    const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);

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

    const resetGame = useCallback(() => {
      setGameState(createNewGame());
    }, []);

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
              className={`text-xl font-medium ${
                gameState.winner === "red" ? "text-red-600" : "text-blue-600"
              }`}
            >
              {gameState.winner === "red" ? "紅方" : "藍方"}勝利！
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-2">
              <span className="text-stone-600 font-light">當前回合:</span>
              <div
                className={`w-4 h-4 rounded-full ${
                  gameState.currentPlayer === "red"
                    ? "bg-red-600"
                    : "bg-blue-600"
                }`}
              ></div>
              <span
                className={`font-medium ${
                  gameState.currentPlayer === "red"
                    ? "text-red-600"
                    : "text-blue-600"
                }`}
              >
                {gameState.currentPlayer === "red" ? "紅方" : "藍方"}
              </span>
            </div>
            {gameState.selectedPiece && (
              <div className="text-stone-500 text-sm">
                已選棋子: ({gameState.selectedPiece[0]},{" "}
                {gameState.selectedPiece[1]})
              </div>
            )}
          </>
        )}
      </div>
    );

    return (
      <div className="w-full">
        <GameStatusSimple />

        <div className="game-layout-grid">
          <div style={{ gridArea: "board" }}>
            <GameBoard gameState={gameState} onPieceClick={handlePieceClick} />
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
