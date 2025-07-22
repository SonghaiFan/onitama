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

    // Clear possible moves when player changes or selections are cleared
    React.useEffect(() => {
      setPossibleMoves([]);
    }, [gameState.currentPlayer, gameState.selectedPiece, gameState.selectedCard]);

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
            } else {
              // Clear possible moves if no card selected
              setPossibleMoves([]);
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
        } else {
          // Clicking on empty space without valid move - clear selection
          setGameState({ ...gameState, selectedPiece: null, selectedCard: null });
          setPossibleMoves([]);
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

    // Static card data - only changes when cards change (rarely)
    const staticCards = React.useMemo(() => {
      const redCards = gameState.players.red.cards;
      const blueCards = gameState.players.blue.cards;
      const sharedCard = gameState.sharedCard;

      return [
        { card: redCards[0], position: "red-left" },
        { card: redCards[1], position: "red-right" },
        { card: blueCards[0], position: "blue-left" },
        { card: blueCards[1], position: "blue-right" },
        { 
          card: sharedCard, 
          position: sharedCard.color === "blue" ? "shared-left" : "shared-right" 
        },
      ];
    }, [
      gameState.players.red.cards[0]?.name,
      gameState.players.red.cards[1]?.name,
      gameState.players.blue.cards[0]?.name,
      gameState.players.blue.cards[1]?.name,
      gameState.sharedCard.name,
      gameState.sharedCard.color,
    ]);

    // Cards with selection state - efficiently computed
    const cards = React.useMemo(() => {
      return staticCards.map((staticCard) => ({
        ...staticCard,
        isSelected: 
          (staticCard.position === "red-left" && gameState.currentPlayer === "red" && gameState.selectedCard === 0) ||
          (staticCard.position === "red-right" && gameState.currentPlayer === "red" && gameState.selectedCard === 1) ||
          (staticCard.position === "blue-left" && gameState.currentPlayer === "blue" && gameState.selectedCard === 0) ||
          (staticCard.position === "blue-right" && gameState.currentPlayer === "blue" && gameState.selectedCard === 1),
      }));
    }, [staticCards, gameState.currentPlayer, gameState.selectedCard]);

    // Simple game status
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
          {/* Cards Component */}
          <MoveCards
            cards={cards}
            currentPlayer={gameState.currentPlayer}
            onCardClick={handleCardClick}
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
