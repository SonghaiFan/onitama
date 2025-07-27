"use client";

import React, {
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import GameBoard from "./GameBoard";
import Card from "./MoveCards";
import { GameState, Player } from "@/types/game";
import { INITIAL_GAME_STATE, createNewGameAsync } from "@/utils/dataLoader";
import {
  isValidMove,
  executeMove,
  getAllPossibleMoves,
  validateWindSpiritMove,
} from "@/utils/gameManager";

type Language = "zh" | "en";

// Bilingual content for game interface
const gameContent = {
  zh: {
    victory: "勝利！",
    currentTurn: "當前回合:",
    redPlayer: "紅方",
    bluePlayer: "藍方",
    loading: "載入卡牌包...",
    warnings: "警告",
    close: "關閉",
    dualWindPhase: "风起云涌",
  },
  en: {
    victory: "Victory!",
    currentTurn: "Current Turn:",
    redPlayer: "Red",
    bluePlayer: "Blue",
    loading: "Loading card pack...",
    warnings: "Warnings",
    close: "Close",
    dualWindPhase: "Wind Move",
  },
};

interface OnitamaGameProps {
  cardPacks?: ("normal" | "senseis" | "windway" | "promo" | "dual")[];
  language?: Language;
}

const OnitamaGame = forwardRef<{ resetGame: () => void }, OnitamaGameProps>(
  function OnitamaGame({ cardPacks = ["normal"], language = "zh" }, ref) {
    const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
    const [isLoading, setIsLoading] = useState(true);

    // Load the appropriate card pack when component mounts or cardPacks changes
    useEffect(() => {
      const loadGame = async () => {
        setIsLoading(true);
        try {
          const result = await createNewGameAsync(cardPacks);
          setGameState(result.gameState);
        } catch (error) {
          console.error("Failed to load card packs:", error);
          // Fallback to normal game state
          setGameState(INITIAL_GAME_STATE);
        } finally {
          setIsLoading(false);
        }
      };

      loadGame();
    }, [cardPacks]);

    const handlePieceClick = useCallback(
      (position: [number, number]) => {
        if (gameState.winner) return;

        const [row, col] = position;
        const piece = gameState.board[row][col];

        // Handle move to empty square or capture
        if (
          !piece &&
          gameState.selectedPiece &&
          gameState.selectedCard !== null
        ) {
          // Validate move using getAllPossibleMoves

          // Use getAllPossibleMoves for validation
          const possibleMoves = getAllPossibleMoves(
            gameState,
            gameState.selectedPiece,
            gameState.selectedCard
          );

          if (possibleMoves.some(([r, c]) => r === row && c === col)) {
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

        // Handle piece selection or capture
        if (piece) {
          // In dual move mode, only allow wind spirit selection
          if (gameState.isDualMoveInProgress) {
            if (piece.isWindSpirit) {
              const newGameState = { ...gameState, selectedPiece: position };
              setGameState(newGameState);
            }
            return;
          }

          // Select own piece or wind spirit (any player can select wind spirits)
          if (piece.player === gameState.currentPlayer || piece.isWindSpirit) {
            // Additional validation for wind spirit moves
            if (piece.isWindSpirit && gameState.selectedCard !== null) {
              const card =
                gameState.players[gameState.currentPlayer].cards[
                  gameState.selectedCard
                ];
              if (!validateWindSpiritMove(gameState, piece, card)) {
                return; // Don't allow invalid wind spirit moves
              }
            }

            const newGameState = { ...gameState, selectedPiece: position };
            setGameState(newGameState);
          } else if (
            gameState.selectedPiece &&
            gameState.selectedCard !== null
          ) {
            // Capture opponent's piece

            // Use getAllPossibleMoves for validation
            const possibleMoves = getAllPossibleMoves(
              gameState,
              gameState.selectedPiece,
              gameState.selectedCard
            );

            if (possibleMoves.some(([r, c]) => r === row && c === col)) {
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
          // Clear selection when clicking empty square
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
        // Prevent card changes during dual move sequence
        if (gameState.isDualMoveInProgress) return;

        const newGameState = { ...gameState, selectedCard: cardIndex };
        setGameState(newGameState);
      },
      [gameState]
    );

    const handleCardSelect = useCallback(
      (cardIndex: number) => {
        if (gameState.winner) return;
        // Prevent card changes during dual move sequence
        if (gameState.isDualMoveInProgress) return;

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

        if (
          isValidMove(
            from,
            to,
            selectedCard,
            gameState.board,
            gameState.currentPlayer
          )
        ) {
          const newGameState = executeMove(gameState, from, to, cardIndex);
          setGameState(newGameState);
        }
      },
      [gameState]
    );

    const resetGame = useCallback(async () => {
      setIsLoading(true);
      try {
        const result = await createNewGameAsync(cardPacks);
        setGameState(result.gameState);
      } catch (error) {
        console.error("Failed to reset game:", error);
        setGameState(INITIAL_GAME_STATE);
      } finally {
        setIsLoading(false);
      }
    }, [cardPacks]);

    useImperativeHandle(ref, () => ({
      resetGame,
    }));

    const GameStatusSimple = () => (
      <div className="relative flex items-center justify-center space-x-0.5 sm:space-x-2 lg:space-x-4 mb-0.5 sm:mb-2 lg:mb-4 z-25">
        {gameState.winner ? (
          <div className="flex items-center space-x-0.5 sm:space-x-1.5">
            <span
              className={`text-base sm:text-lg font-medium zen-text ${
                gameState.winner === "red" ? "text-red-600" : "text-blue-600"
              }`}
            >
              {gameState.winner === "red"
                ? gameContent[language].redPlayer
                : gameContent[language].bluePlayer}
              {gameContent[language].victory}
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-0.5 sm:space-x-1">
            <span className="text-stone-600 font-light zen-text text-xs sm:text-sm">
              {gameContent[language].currentTurn}
            </span>
            <div
              className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 rounded-full animate-pulse shadow-lg ${
                gameState.currentPlayer === "red"
                  ? "bg-red-600 shadow-red-300"
                  : "bg-blue-600 shadow-blue-300"
              }`}
            ></div>
            <span
              className={`font-bold text-sm sm:text-base zen-text ${
                gameState.currentPlayer === "red"
                  ? "text-red-600"
                  : "text-blue-600"
              }`}
            >
              {gameState.currentPlayer === "red"
                ? gameContent[language].redPlayer
                : gameContent[language].bluePlayer}
            </span>
            {gameState.isDualMoveInProgress && (
              <div className="flex items-center space-x-1 ml-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600 font-medium text-xs sm:text-sm">
                  {gameContent[language].dualWindPhase}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-48 sm:h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-stone-600 mx-auto mb-3 sm:mb-4"></div>
            <p className="text-stone-600 font-light text-sm sm:text-base">
              {gameContent[language].loading}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col watercolor-wash z-10 relative">
        {/* Full game board gradient for current player */}
        <div
          className={`absolute inset-0 -z-10 transition-all duration-300 pointer-events-none ${
            gameState.winner
              ? gameState.winner === "red"
                ? "bg-gradient-to-b from-red-500/40 to-red-400/20"
                : "bg-gradient-to-t from-blue-500/40 to-blue-400/20"
              : gameState.currentPlayer === "red"
              ? "bg-gradient-to-t from-red-400/20 to-transparent"
              : "bg-gradient-to-b from-blue-400/20 to-transparent"
          }`}
        />

        <div className="game-layout-grid flex-1">
          <div
            style={{
              gridArea:
                gameState.currentPlayer === "blue"
                  ? "shared-right"
                  : "shared-left",
            }}
            className="flex items-center justify-center"
          >
            <GameStatusSimple />
          </div>
          <div
            style={{ gridArea: "board" }}
            className="h-full flex items-center justify-center"
          >
            <GameBoard
              gameState={gameState}
              onPieceClick={handlePieceClick}
              onCardSelect={handleCardSelect}
              onPieceMove={handlePieceMove}
            />
          </div>

          {/* Blue Player's Cards */}
          <Card
            card={gameState.players.blue.cards[0]}
            gridArea="blue-left"
            isSelected={
              gameState.currentPlayer === "blue" && gameState.selectedCard === 0
            }
            playerOwner="blue"
            currentPlayer={gameState.currentPlayer}
            cardIndex={0}
            onCardClick={handleCardClick}
            language={language}
            isDualMoveInProgress={
              gameState.isDualMoveInProgress && gameState.selectedCard === 0
            }
          />
          <Card
            card={gameState.players.blue.cards[1]}
            gridArea="blue-right"
            isSelected={
              gameState.currentPlayer === "blue" && gameState.selectedCard === 1
            }
            playerOwner="blue"
            currentPlayer={gameState.currentPlayer}
            cardIndex={1}
            onCardClick={handleCardClick}
            language={language}
            isDualMoveInProgress={
              gameState.isDualMoveInProgress && gameState.selectedCard === 1
            }
          />

          {/* Red Player's Cards */}
          <Card
            card={gameState.players.red.cards[0]}
            gridArea="red-left"
            isSelected={
              gameState.currentPlayer === "red" && gameState.selectedCard === 0
            }
            playerOwner="red"
            currentPlayer={gameState.currentPlayer}
            cardIndex={0}
            onCardClick={handleCardClick}
            language={language}
            isDualMoveInProgress={
              gameState.isDualMoveInProgress && gameState.selectedCard === 0
            }
          />
          <Card
            card={gameState.players.red.cards[1]}
            gridArea="red-right"
            isSelected={
              gameState.currentPlayer === "red" && gameState.selectedCard === 1
            }
            playerOwner="red"
            currentPlayer={gameState.currentPlayer}
            cardIndex={1}
            onCardClick={handleCardClick}
            language={language}
            isDualMoveInProgress={
              gameState.isDualMoveInProgress && gameState.selectedCard === 1
            }
          />

          {/* Shared Card - positioned based on next player */}
          <Card
            card={gameState.sharedCard}
            gridArea={
              gameState.currentPlayer === "blue"
                ? "shared-left" // Blue's turn, shared card goes to red's area (left side)
                : "shared-right" // Red's turn, shared card goes to blue's area (right side)
            }
            isSelected={false}
            playerOwner="shared"
            currentPlayer={gameState.currentPlayer}
            onCardClick={() => {}}
            language={language}
          />
        </div>
      </div>
    );
  }
);

export default OnitamaGame;
