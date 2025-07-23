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
import {
  INITIAL_GAME_STATE,
  isValidMove,
  executeMove,
  createNewGameAsync,
} from "@/utils/gameLogic";

type Language = "zh" | "en";

// Bilingual content for game interface
const gameContent = {
  zh: {
    victory: "勝利！",
    currentTurn: "當前回合:",
    redPlayer: "紅方",
    bluePlayer: "藍方",
    loading: "載入卡牌包...",
  },
  en: {
    victory: "Victory!",
    currentTurn: "Current Turn:",
    redPlayer: "Red",
    bluePlayer: "Blue",
    loading: "Loading card pack...",
  },
};

interface OnitamaGameProps {
  cardPack?: "normal" | "senseis";
  language?: Language;
}

const OnitamaGame = forwardRef<{ resetGame: () => void }, OnitamaGameProps>(
  function OnitamaGame({ cardPack = "normal", language = "zh" }, ref) {
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

    const GameStatusSimple = () => (
      <div className="flex items-center justify-center space-x-8">
        {gameState.winner ? (
          <div className="flex items-center space-x-3">
            <span
              className={`text-xl font-medium zen-text ${
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
          <>
            <div className="flex items-center space-x-2">
              <span className="text-stone-600 font-light zen-text">
                {gameContent[language].currentTurn}
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
                {gameState.currentPlayer === "red"
                  ? gameContent[language].redPlayer
                  : gameContent[language].bluePlayer}
              </span>
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
            <p className="text-stone-600 font-light">
              {gameContent[language].loading}
            </p>
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

          {/* Shared Card */}
          <Card
            card={gameState.sharedCard}
            gridArea={
              gameState.sharedCard.color === "blue"
                ? "shared-left"
                : "shared-right"
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
