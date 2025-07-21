"use client";

import { useState, useCallback } from "react";
import GameBoard from "./GameBoard";
import MoveCards from "./MoveCards";
import GameStatus from "./GameStatus";
import { GameState, Player } from "@/types/game";
import {
  INITIAL_GAME_STATE,
  getPossibleMoves,
  isValidMove,
  executeMove,
  createNewGame,
} from "@/utils/gameLogic";

export default function OnitamaGame() {
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

  const handleCardClick = useCallback(
    (cardIndex: number) => {
      if (gameState.winner) return;

      const newGameState = { ...gameState, selectedCard: cardIndex };
      setGameState(newGameState);

      // Show possible moves if a piece is also selected
      if (gameState.selectedPiece) {
        const [row, col] = gameState.selectedPiece;
        const piece = gameState.board[row][col];
        if (piece) {
          const selectedCard =
            gameState.players[gameState.currentPlayer].cards[cardIndex];
          const moves = getPossibleMoves(piece, selectedCard, gameState.board);
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

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
      {/* Game Board */}
      <div className="flex-1 max-w-md">
        <GameBoard
          gameState={gameState}
          onPieceClick={handlePieceClick}
          possibleMoves={possibleMoves}
        />
      </div>

      {/* Side Panel */}
      <div className="flex-1 max-w-md space-y-6">
        <GameStatus gameState={gameState} />

        {/* Blue Player Cards (top) */}
        <div className="transform rotate-180">
          <MoveCards
            cards={gameState.players.blue.cards}
            player="blue"
            onCardClick={handleCardClick}
            isCurrentPlayer={gameState.currentPlayer === "blue"}
            selectedCard={
              gameState.currentPlayer === "blue" ? gameState.selectedCard : null
            }
          />
        </div>

        {/* Shared Card - Authentic Style */}
        <div className="flex justify-center">
          <div className="relative bg-gradient-to-br from-amber-50 to-orange-100 p-4 rounded-lg border-2 border-yellow-500 shadow-lg">
            <div className="text-sm font-bold text-center mb-2 text-gray-800">
              Shared Card
            </div>
            <div className="text-xs font-semibold text-center mb-3 bg-white/70 py-1 px-2 rounded text-gray-700">
              {gameState.sharedCard.name}
            </div>

            {/* 5x5 Grid Display - Like Real Cards */}
            <div className="w-24 h-24 mx-auto bg-white/90 rounded border border-gray-300 grid grid-cols-5 gap-0.5 p-1">
              {/* Display shared card pattern */}
              {Array.from({ length: 5 }, (_, i) =>
                Array.from({ length: 5 }, (_, j) => {
                  // Center position
                  if (i === 2 && j === 2) {
                    return (
                      <div
                        key={`${i}-${j}`}
                        className="w-4 h-4 border border-gray-200 bg-gray-800"
                      />
                    );
                  }

                  // Check if this position has a move
                  const hasMove = gameState.sharedCard.moves.some((move) => {
                    const displayRow = 2 - move.y;
                    const displayCol = 2 + move.x;
                    return displayRow === i && displayCol === j;
                  });

                  return (
                    <div
                      key={`${i}-${j}`}
                      className={`w-4 h-4 border border-gray-200 ${
                        hasMove ? "bg-yellow-500" : "bg-gray-50"
                      }`}
                    />
                  );
                })
              )}
            </div>

            {/* Color Indicator */}
            <div className="flex justify-center mt-3">
              <div
                className={`w-6 h-3 rounded-sm ${
                  gameState.sharedCard.color === "red"
                    ? "bg-red-600"
                    : "bg-blue-600"
                }`}
              ></div>
            </div>
          </div>
        </div>

        {/* Red Player Cards (bottom) */}
        <MoveCards
          cards={gameState.players.red.cards}
          player="red"
          onCardClick={handleCardClick}
          isCurrentPlayer={gameState.currentPlayer === "red"}
          selectedCard={
            gameState.currentPlayer === "red" ? gameState.selectedCard : null
          }
        />

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            New Game
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
          <div className="font-semibold mb-2">How to Play:</div>
          <div className="space-y-1">
            <div>1. Select one of your cards</div>
            <div>2. Click on your piece to select it</div>
            <div>3. Click on a highlighted square to move</div>
            <div className="text-xs text-blue-600 mt-2">
              Green circles = valid moves | Red dots = capture moves
            </div>
          </div>
        </div>

        {/* Card Info */}
        <div className="bg-green-50 p-3 rounded-lg text-sm text-green-800">
          <div className="font-semibold mb-2">🎴 Authentic Onitama Cards</div>
          <div className="text-green-700">
            Playing with official cards: {gameState.players.red.cards[0].name},{" "}
            {gameState.players.red.cards[1].name},{" "}
            {gameState.players.blue.cards[0].name},{" "}
            {gameState.players.blue.cards[1].name}, and{" "}
            {gameState.sharedCard.name}
          </div>
        </div>
      </div>
    </div>
  );
}
