"use client";

import React, {
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { motion } from "framer-motion";
import GameBoard from "./GameBoard";
import { GameState, Player } from "@/types/game";
import {
  INITIAL_GAME_STATE,
  getPossibleMoves,
  isValidMove,
  executeMove,
  createNewGame,
} from "@/utils/gameLogic";

const OnitamaGame = forwardRef<{ resetGame: () => void }, {}>(
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

    // Universal Card Component
    const UniversalCard = ({
      cardData,
    }: {
      cardData: { card: any; position: string; isSelected: boolean };
    }) => {
      const { card, position, isSelected } = cardData;
      const isShared = position.startsWith("shared");
      const isBlue = position.startsWith("blue");
      const isRed = position.startsWith("red");
      const isRotated = isBlue || (isShared && position === "shared-left");

      // Get position coordinates
      const getPositionStyle = (pos: string) => {
        const positions = {
          "red-left": { x: -80, y: 200 },
          "red-right": { x: 80, y: 200 },
          "blue-left": { x: -80, y: -200 },
          "blue-right": { x: 80, y: -200 },
          "shared-left": { x: -280, y: 0 },
          "shared-right": { x: 280, y: 0 },
        };
        return positions[pos as keyof typeof positions] || { x: 0, y: 0 };
      };

      const posStyle = getPositionStyle(position);

      const handleClick = () => {
        if (isShared) return; // Can't click shared card

        if (isRed && gameState.currentPlayer === "red") {
          const cardIndex = position === "red-left" ? 0 : 1;
          handleCardClick(cardIndex);
        } else if (isBlue && gameState.currentPlayer === "blue") {
          const cardIndex = position === "blue-left" ? 0 : 1;
          handleCardClick(cardIndex);
        }
      };

      return (
        <motion.div
          className={`absolute zen-card p-4 border cursor-pointer select-none
          ${isShared ? "p-6" : ""}
          ${
            isRed
              ? "border-red-300"
              : isBlue
              ? "border-blue-300"
              : "border-stone-300"
          }
          ${
            isSelected ? "ring-2 ring-amber-400 border-amber-400 shadow-xl" : ""
          }
          ${!isShared ? "w-32" : ""}
        `}
          initial={{ x: 0, y: 0, rotate: 0 }}
          animate={{
            x: posStyle.x,
            y: posStyle.y,
            rotate: isRotated ? 180 : 0,
            scale: isSelected ? 1.05 : 1,
          }}
          whileHover={{
            scale:
              !isShared &&
              ((isRed && gameState.currentPlayer === "red") ||
                (isBlue && gameState.currentPlayer === "blue"))
                ? 1.08
                : isSelected
                ? 1.05
                : 1,
            y:
              !isShared &&
              ((isRed && gameState.currentPlayer === "red") ||
                (isBlue && gameState.currentPlayer === "blue"))
                ? posStyle.y - 4
                : posStyle.y,
            transition: { type: "spring", stiffness: 400, damping: 10 },
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClick}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            duration: 0.8,
          }}
          style={{ zIndex: isSelected ? 30 : isShared ? 25 : 15 }}
        >
          {/* Card Title for shared cards */}
          {isShared && (
            <motion.div
              className="text-lg font-light text-stone-800 mb-4 tracking-wide text-center"
              animate={{ rotate: isRotated ? 180 : 0 }}
              transition={{ duration: 0.6 }}
            >
              共用牌
            </motion.div>
          )}

          {isShared && (
            <div className="w-12 h-px bg-stone-300 mx-auto mb-6"></div>
          )}

          {/* Card Content */}
          <div
            className={`zen-card ${
              isShared ? "p-3" : "p-0"
            } border border-stone-300`}
          >
            <div className="text-xs font-light text-center mb-3 text-stone-800 bg-stone-100/80 py-1 px-2 border border-stone-200">
              {card.name}
            </div>

            {/* 5x5 Grid Display */}
            <div className="w-20 h-20 mx-auto bg-stone-100/90 border border-stone-300 grid grid-cols-5 gap-0.5 p-1">
              {Array.from({ length: 5 }, (_, i) =>
                Array.from({ length: 5 }, (_, j) => {
                  const actualI = isRotated ? 4 - i : i;
                  const actualJ = isRotated ? 4 - j : j;

                  if (actualI === 2 && actualJ === 2) {
                    return (
                      <div
                        key={`${i}-${j}`}
                        className="w-3 h-3 border border-stone-300 bg-stone-800 flex items-center justify-center"
                      >
                        <span className="text-[10px] text-stone-100">中</span>
                      </div>
                    );
                  }

                  const hasMove = card.moves.some((move: any) => {
                    const displayRow = 2 - move.y;
                    const displayCol = 2 + move.x;
                    return displayRow === actualI && displayCol === actualJ;
                  });

                  return (
                    <div
                      key={`${i}-${j}`}
                      className={`w-3 h-3 border border-stone-300 ${
                        hasMove
                          ? isRed
                            ? "bg-red-600"
                            : isBlue
                            ? "bg-emerald-600"
                            : "bg-amber-500"
                          : "bg-stone-50"
                      }`}
                    />
                  );
                })
              )}
            </div>

            {/* Color Indicator */}
            <div className="flex justify-center mt-3">
              <div
                className={`w-6 h-1 ${
                  isRed
                    ? "bg-red-600"
                    : isBlue
                    ? "bg-blue-600"
                    : card.color === "red"
                    ? "bg-red-600"
                    : "bg-blue-600"
                }`}
              ></div>
            </div>
          </div>

          {/* Shared card next turn indicator */}
          {isShared && (
            <motion.div
              className="mt-6 text-xs text-stone-500 font-light text-center"
              animate={{ rotate: isRotated ? 180 : 0 }}
              transition={{ duration: 0.6 }}
            >
              下一回合輪到
              <span
                className={`ml-1 ${
                  card.color === "red" ? "text-red-600" : "text-blue-600"
                }`}
              >
                {card.color === "red" ? "紅方" : "藍方"}
              </span>
            </motion.div>
          )}
        </motion.div>
      );
    };

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
      <div className="max-w-7xl mx-auto">
        {/* Simple Game Status */}
        <GameStatusSimple />

        {/* All Cards Container - Relative positioning for absolute cards */}
        <div className="relative flex justify-center items-center min-h-[600px] min-w-[800px] mx-auto">
          {/* Render all 5 cards */}
          {allCards.map((cardData) => (
            <UniversalCard
              key={`${cardData.card.name}-${cardData.position}`}
              cardData={cardData}
            />
          ))}

          {/* Game Board - Centered */}
          <div className="relative z-20">
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
