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
import { INITIAL_GAME_STATE, createNewGameAsync } from "@/utils/gameLogic";
import { isValidMove, executeMove } from "@/utils/coreGameMechanics";

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
  },
  en: {
    victory: "Victory!",
    currentTurn: "Current Turn:",
    redPlayer: "Red",
    bluePlayer: "Blue",
    loading: "Loading card pack...",
    warnings: "Warnings",
    close: "Close",
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
    const [warnings, setWarnings] = useState<string[]>([]);
    const [showWarnings, setShowWarnings] = useState(false);

    // Load the appropriate card pack when component mounts or cardPacks changes
    useEffect(() => {
      const loadGame = async () => {
        setIsLoading(true);
        try {
          const result = await createNewGameAsync(cardPacks);
          setGameState(result.gameState);
          setWarnings(result.warnings);
          if (result.warnings.length > 0) {
            setShowWarnings(true);
          }
        } catch (error) {
          console.error("Failed to load card packs:", error);
          // Fallback to normal game state
          setGameState(INITIAL_GAME_STATE);
          setWarnings([
            `Failed to load card packs: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          ]);
          setShowWarnings(true);
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
          const selectedCard =
            gameState.players[gameState.currentPlayer].cards[
              gameState.selectedCard
            ];
          if (
            isValidMove(
              gameState.selectedPiece,
              position,
              selectedCard,
              gameState.board,
              gameState.currentPlayer
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

        // Handle piece selection or capture
        if (piece) {
          // Select own piece or wind spirit (any player can select wind spirits)
          if (piece.player === gameState.currentPlayer || piece.isWindSpirit) {
            const newGameState = { ...gameState, selectedPiece: position };
            setGameState(newGameState);
          } else if (
            gameState.selectedPiece &&
            gameState.selectedCard !== null
          ) {
            // Capture opponent's piece
            const selectedCard =
              gameState.players[gameState.currentPlayer].cards[
                gameState.selectedCard
              ];
            if (
              isValidMove(
                gameState.selectedPiece,
                position,
                selectedCard,
                gameState.board,
                gameState.currentPlayer
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
        setWarnings(result.warnings);
        if (result.warnings.length > 0) {
          setShowWarnings(true);
        }
      } catch (error) {
        console.error("Failed to reset game:", error);
        setGameState(INITIAL_GAME_STATE);
        setWarnings([
          `Failed to reset game: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        ]);
        setShowWarnings(true);
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
      <div className="w-full h-full flex flex-col watercolor-wash z-10">
        {/* Warning Modal */}
        {showWarnings && warnings.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-red-600">
                  {gameContent[language].warnings}
                </h3>
                <button
                  onClick={() => setShowWarnings(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2">
                {warnings.map((warning, index) => (
                  <p key={index} className="text-sm text-gray-700">
                    {warning}
                  </p>
                ))}
              </div>
              <button
                onClick={() => setShowWarnings(false)}
                className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
              >
                {gameContent[language].close}
              </button>
            </div>
          </div>
        )}

        <div className="game-layout-grid flex-1">
          <GameStatusSimple />
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
