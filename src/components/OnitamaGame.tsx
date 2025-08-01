"use client";

import React, { forwardRef, useImperativeHandle } from "react";
import { useGame } from "@/contexts/GameContext";
import GameBoard from "./GameBoard";
import Card from "./MoveCards";
import { getPlayerColors } from "@/utils/gameAestheticConfig";
import { gameEventBus, GameEvents } from "@/utils/eventBus";

type Language = "zh" | "en";

// Bilingual content for game interface
const gameContent = {
  zh: {
    victory: "勝利！",
    currentTurn: "當前回合:",
    redPlayer: "紅方",
    bluePlayer: "藍方",
    loading: "載入卡牌包...",
    aiMode: "AI 模式",
    settings: "設置",
    windMove: "風起雲湧",
    aiThinking: "AI 思考中",
  },
  en: {
    victory: "Victory!",
    currentTurn: "Current Turn:",
    redPlayer: "Red",
    bluePlayer: "Blue",
    loading: "Loading card pack...",
    aiMode: "AI Mode",
    settings: "Settings",
    windMove: "Wind Way",
    aiThinking: "AI Thinking",
  },
};

interface OnitamaGameProps {
  cardPacks?: (
    | "normal"
    | "senseis"
    | "windway"
    | "promo"
    | "dual"
    | "special"
  )[];
  language?: Language;
}

const OnitamaGame = forwardRef<{ resetGame: () => void }, OnitamaGameProps>(
  function OnitamaGame({ cardPacks = ["normal"], language = "zh" }, ref) {
    const {
      gameState,
      isLoading,
      selectPiece,
      selectCard,
      executeMove,
      resetGame,
    } = useGame();

    // Expose reset function to parent
    useImperativeHandle(ref, () => ({
      resetGame: () => resetGame(cardPacks),
    }));

    // Handle piece click with event bus integration
    const handlePieceClick = (position: [number, number]) => {
      selectPiece(position);
      gameEventBus.publish(GameEvents.PIECE_SELECTED, { position });
    };

    // Handle card click with event bus integration
    const handleCardClick = (cardIndex: number, player: "red" | "blue") => {
      selectCard(cardIndex, player);
      gameEventBus.publish(GameEvents.CARD_SELECTED, { cardIndex, player });
    };

    // Handle piece move with event bus integration
    const handlePieceMove = (
      from: [number, number],
      to: [number, number],
      cardIndex: number
    ) => {
      executeMove(from, to, cardIndex);
      gameEventBus.publish(GameEvents.MOVE_EXECUTED, { from, to, cardIndex });
    };

    // Game status component
    const GameStatusSimple = () => (
      <div
        className={`relative flex items-center justify-center space-x-0.5 sm:space-x-2 lg:space-x-4 mb-0.5 sm:mb-2 lg:mb-4 z-25 ${
          gameState.currentPlayer === "blue" ? "rotate-180" : ""
        }`}
      >
        {gameState.winner ? (
          <div className="flex items-center space-x-0.5 sm:space-x-1.5">
            <span
              className={`text-base sm:text-lg font-medium zen-text ${
                getPlayerColors(gameState.winner).tailwind.text
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
                getPlayerColors(gameState.currentPlayer).tailwind.shadow
              }`}
              style={{
                backgroundColor: getPlayerColors(gameState.currentPlayer).cssVar
                  .primary,
              }}
            />
            <span
              className={`font-bold text-sm sm:text-base zen-text ${
                getPlayerColors(gameState.currentPlayer).tailwind.text
              }`}
            >
              {gameState.currentPlayer === "red"
                ? gameContent[language].redPlayer
                : gameContent[language].bluePlayer}
            </span>
            {gameState.isDualMoveInProgress && (
              <div className="flex items-center space-x-1 ml-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-500 rounded-full animate-pulse" />
                <span className="text-gray-600 font-medium text-xs sm:text-sm">
                  {gameContent[language].windMove}
                </span>
              </div>
            )}
            {gameState.isAITurn && (
              <div className="flex items-center space-x-1 ml-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full animate-spin" />
                <span className="text-blue-600 font-medium text-xs sm:text-sm">
                  {gameContent[language].aiThinking}
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
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-stone-600 mx-auto mb-3 sm:mb-4" />
            <p className="text-stone-600 font-light text-sm sm:text-base">
              {gameContent[language].loading}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col watercolor-wash z-10 relative">
        <div
          className={`absolute inset-0 -z-10 pointer-events-none ${
            gameState.winner
              ? gameState.winner === "red"
                ? `bg-gradient-to-t ${
                    getPlayerColors("red").tailwind.gradient
                  } via-transparent to-transparent`
                : `bg-gradient-to-b ${
                    getPlayerColors("blue").tailwind.gradient
                  } via-transparent to-transparent`
              : gameState.currentPlayer === "red"
              ? `bg-gradient-to-t ${
                  getPlayerColors("red").tailwind.gradientLight
                } via-transparent to-transparent`
              : `bg-gradient-to-b ${
                  getPlayerColors("blue").tailwind.gradientLight
                } via-transparent to-transparent`
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
              onCardSelect={(cardIndex) =>
                selectCard(cardIndex, gameState.currentPlayer)
              }
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

          {/* Shared Card */}
          <Card
            card={gameState.sharedCard}
            gridArea={
              gameState.currentPlayer === "blue"
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
