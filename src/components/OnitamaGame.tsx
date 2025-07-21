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
  getPossibleMoves,
  isValidMove,
  executeMove,
  createNewGame,
} from "@/utils/gameLogic";

const OnitamaGame = forwardRef<{ resetGame: () => void }, object>(
  function OnitamaGame(props, ref) {
    const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
    const [possibleMoves, setPossibleMoves] = useState<[number, number][]>([]);

    const handlePieceClick = useCallback(
      (position: [number, number]) => {
        if (gameState.winner) return;

        const [row, col] = position;
        const piece = gameState.board[row][col];

        // If clicking on empty space and we have a selected piece and card, try to move
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
            setPossibleMoves([]);
          }
          return;
        }

        // If clicking on a piece
        if (piece) {
          // If it's the current player's piece, select it
          if (piece.player === gameState.currentPlayer) {
            const newGameState = { ...gameState, selectedPiece: position };
            setGameState(newGameState);

            // Show possible moves if a card is also selected
            if (gameState.selectedCard !== null) {
              const selectedCard =
                gameState.players[gameState.currentPlayer].cards[
                  gameState.selectedCard
                ];
              const moves = getPossibleMoves(
                piece,
                selectedCard,
                gameState.board
              );
              setPossibleMoves(moves);
            }
          }
          // If it's an opponent's piece and we can capture it
          else if (gameState.selectedPiece && gameState.selectedCard !== null) {
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
              setPossibleMoves([]);
            }
          }
        }
      },
      [gameState]
    );

    const handleUniversalCardClick = useCallback(
      (cardIndex: number, player: Player) => {
        if (gameState.winner) return;
        if (player !== gameState.currentPlayer) return;

        const newGameState = { ...gameState, selectedCard: cardIndex };
        setGameState(newGameState);

        // Show possible moves if a piece is also selected
        if (gameState.selectedPiece) {
          const [row, col] = gameState.selectedPiece;
          const piece = gameState.board[row][col];
          if (piece) {
            const selectedCard =
              gameState.players[gameState.currentPlayer].cards[cardIndex];
            const moves = getPossibleMoves(
              piece,
              selectedCard,
              gameState.board
            );
            setPossibleMoves(moves);
          }
        }
      },
      [gameState]
    );

    const resetGame = useCallback(() => {
      setGameState(createNewGame()); // Use createNewGame for fresh random cards
      setPossibleMoves([]);
    }, []);

    useImperativeHandle(ref, () => ({
      resetGame,
    }));

    // Get all 5 cards and their positions - memoized to prevent unnecessary re-renders
    const allCards = React.useMemo(() => {
      const redCards = gameState.players.red.cards;
      const blueCards = gameState.players.blue.cards;
      const sharedCard = gameState.sharedCard;

      return [
        // Red cards (bottom)
        {
          card: redCards[0],
          position: "red-left",
          isSelected:
            gameState.currentPlayer === "red" && gameState.selectedCard === 0,
        },
        {
          card: redCards[1],
          position: "red-right",
          isSelected:
            gameState.currentPlayer === "red" && gameState.selectedCard === 1,
        },
        // Blue cards (top, rotated)
        {
          card: blueCards[0],
          position: "blue-left",
          isSelected:
            gameState.currentPlayer === "blue" && gameState.selectedCard === 0,
        },
        {
          card: blueCards[1],
          position: "blue-right",
          isSelected:
            gameState.currentPlayer === "blue" && gameState.selectedCard === 1,
        },
        // Shared card (left or right)
        {
          card: sharedCard,
          position:
            sharedCard.color === "blue" ? "shared-left" : "shared-right",
          isSelected: false,
        },
      ];
    }, [
      gameState.players.red.cards,
      gameState.players.blue.cards,
      gameState.sharedCard,
      gameState.currentPlayer,
      gameState.selectedCard,
    ]);

    // Simple game status without heavy styling
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
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
        {/* Simple Game Status */}
        <GameStatusSimple />

        {/* Responsive Game Container with container queries */}
        <div className="relative flex justify-center items-center min-h-[80vh] sm:min-h-[85vh] lg:min-h-screen w-full overflow-hidden game-container @container">
          {/* Universal Cards Component */}
          <MoveCards
            isUniversal={true}
            allCards={allCards}
            currentPlayer={gameState.currentPlayer}
            onUniversalCardClick={handleUniversalCardClick}
          />

          {/* Game Board - Centered with responsive scaling */}
          <div className="relative z-20 flex justify-center items-center scale-75 sm:scale-90 lg:scale-100">
            <GameBoard
              gameState={gameState}
              onPieceClick={handlePieceClick}
              possibleMoves={possibleMoves}
            />
          </div>
        </div>
      </div>
    );
  }
);

export default OnitamaGame;
