"use client";

import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";
import { useGame } from "@/contexts/GameContext";
import GameBoard from "./GameBoard";
import Card from "./MoveCards";
import AIThinkingIndicator, { ThinkingData } from "./ui/AIThinkingIndicator";
import { getPlayerColors } from "@/utils/gameAestheticConfig";
import {
  gameEventBus,
  GameEvents,
  AIThinkingUpdateEvent,
} from "@/utils/eventBus";

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
  },
  en: {
    victory: "Victory!",
    currentTurn: "Current Turn:",
    redPlayer: "Red",
    bluePlayer: "Blue",
    loading: "Loading card pack...",
    aiMode: "AI Mode",
    settings: "Settings",
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
      isAITurn,
      aiPlayer,
      selectPiece,
      selectCard,
      executeMove,
      resetGame,
    } = useGame();

    const [thinkingData, setThinkingData] = useState<ThinkingData | undefined>(
      undefined
    );

    // Listen for AI thinking updates
    useEffect(() => {
      const unsubscribe = gameEventBus.subscribe<AIThinkingUpdateEvent>(
        "ai_thinking_update",
        (data) => {
          setThinkingData({
            score: data.score,
            nodesEvaluated: data.nodesEvaluated,
            depth: data.depth,
            elapsedTime: data.elapsedTime,
            timestamp: Date.now(),
          });
        }
      );

      return unsubscribe;
    }, []);

    // Clear thinking data when AI turn ends
    useEffect(() => {
      if (!isAITurn) {
        setThinkingData(undefined);
      }
    }, [isAITurn]);

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
                  Wind Move
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
        {/* AI Thinking Indicator */}
        {aiPlayer && (
          <div className="absolute top-2 left-2 z-20">
            <AIThinkingIndicator
              isThinking={isAITurn}
              player={aiPlayer}
              language={language}
              thinkingData={thinkingData}
            />
          </div>
        )}

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
