"use client";

import React from "react";
import { motion } from "framer-motion";
import { MoveCard, Player } from "@/types/game";

interface CardProps {
  card: MoveCard;
  gridArea: string; // e.g., 'red-left', 'shared-right'
  isSelected: boolean;
  playerOwner: Player | "shared";
  currentPlayer: Player;
  cardIndex?: number; // 0 or 1 for player cards
  onCardClick: (cardIndex: number, player: Player) => void;
}

// A much simpler, reusable Card component
const Card = React.memo(
  ({
    card,
    gridArea,
    isSelected,
    playerOwner,
    currentPlayer,
    cardIndex,
    onCardClick,
  }: CardProps) => {
    const isBlue = playerOwner === "blue";
    const isRed = playerOwner === "red";
    const isShared = playerOwner === "shared";

    // The shared card on the left side (blue's side) is rotated
    const isRotated = isBlue || (isShared && gridArea === "shared-left");

    const canInteract = !isShared && playerOwner === currentPlayer;

    const handleClick = () => {
      if (canInteract && cardIndex !== undefined) {
        onCardClick(cardIndex, playerOwner as Player);
      }
    };

    return (
      <motion.div
        style={{ gridArea }} // This is the key change!
        className={`
          zen-card scroll-paper p-3 sm:p-4 border select-none w-32 md:w-36 lg:w-40 relative overflow-hidden
          ${
            isRed
              ? "border-red-300 shadow-red-100"
              : isBlue
              ? "border-blue-300 shadow-blue-100"
              : "border-stone-300"
          }
          ${
            isSelected
              ? "ring-2 ring-amber-400 border-amber-400 shadow-xl shadow-amber-200/50"
              : ""
          }
          ${canInteract ? "cursor-pointer hover:shadow-lg" : "cursor-default"}
          ${!canInteract && !isShared ? "opacity-40 grayscale" : ""}
          ${canInteract ? "focus:focus-zen" : ""}
        `}
        animate={{
          rotate: isRotated ? 180 : 0,
          scale: isSelected ? 1.1 : 1,
          boxShadow: isSelected
            ? "0 0 20px rgba(251, 191, 36, 0.6)"
            : "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
        whileHover={{
          scale: canInteract ? (isSelected ? 1.12 : 1.05) : 1,
        }}
        whileTap={{ scale: canInteract ? 0.95 : 1 }}
        onClick={handleClick}
        onKeyDown={(e) => e.key === "Enter" && canInteract && handleClick()}
        tabIndex={canInteract ? 0 : -1}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
      >
        {isShared && (
          <>
            <div className="text-sm sm:text-lg font-light text-stone-800 mb-3 sm:mb-4 tracking-wide text-center zen-text relative">
              <span className="bg-white/80 px-2 py-1 rounded backdrop-blur-sm">
                共用牌
              </span>
            </div>
            <div className="brush-stroke mx-auto mb-4 sm:mb-6"></div>
          </>
        )}

        <div
          className={`zen-card relative overflow-hidden ${
            isShared ? "p-2 sm:p-3" : "p-0"
          } border border-stone-300`}
        >
          {/* Chinese Character Background */}
          {card.displayName && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
              style={{
                transform: isRotated ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <span className="text-6xl sm:text-7xl lg:text-8xl font-light text-stone-200/15 zen-text select-none">
                {card.displayName}
              </span>
            </div>
          )}

          {/* Decorative Corner Elements */}
          <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-stone-300/50 pointer-events-none"></div>
          <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-stone-300/50 pointer-events-none"></div>
          <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-stone-300/50 pointer-events-none"></div>
          <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-stone-300/50 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="text-xs font-light text-center mb-2 sm:mb-3 text-stone-800 bg-stone-100/90 py-1 px-1 sm:px-2 border border-stone-200 backdrop-blur-sm">
              <div className="zen-text font-medium">
                {card.displayName || card.name}
              </div>
              <div className="text-[10px] text-stone-600 mt-0.5">
                {card.name}
              </div>
            </div>

            <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 mx-auto bg-stone-100/95 border border-stone-300 grid grid-cols-5 gap-0.5 p-1 backdrop-blur-sm shadow-inner">
              {Array.from({ length: 5 }, (_, i) =>
                Array.from({ length: 5 }, (_, j) => {
                  const actualI = isRotated ? 4 - i : i;
                  const actualJ = isRotated ? 4 - j : j;

                  if (actualI === 2 && actualJ === 2) {
                    return (
                      <div
                        key={`${i}-${j}`}
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 border border-stone-400 bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center shadow-sm"
                      ></div>
                    );
                  }

                  const hasMove = card.moves.some((move) => {
                    // All card moves are defined from red player's perspective
                    // For blue cards or when blue player views them, we need to show the mirrored version
                    let displayMove = move;
                    if (isBlue && !isShared) {
                      // Mirror the move for blue player's perspective
                      displayMove = { x: move.x, y: -move.y };
                    }

                    const displayRow = 2 - displayMove.y;
                    const displayCol = 2 + displayMove.x;
                    return displayRow === actualI && displayCol === actualJ;
                  });

                  return (
                    <div
                      key={`${i}-${j}`}
                      className={`w-2.5 h-2.5 sm:w-3 sm:h-3 border border-stone-300 transition-colors ${
                        hasMove
                          ? isRed
                            ? "bg-gradient-to-br from-red-500 to-red-700 shadow-sm"
                            : isBlue
                            ? "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-sm"
                            : "bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm"
                          : "bg-stone-50 hover:bg-stone-100"
                      }`}
                    />
                  );
                })
              )}
            </div>

            <div className="flex justify-center mt-2 sm:mt-3">
              <div
                className={`w-8 h-1.5 shadow-sm ${
                  isRed
                    ? "bg-gradient-to-r from-red-500 to-red-600"
                    : isBlue
                    ? "bg-gradient-to-r from-blue-500 to-blue-600"
                    : card.color === "red"
                    ? "bg-gradient-to-r from-red-500 to-red-600"
                    : "bg-gradient-to-r from-blue-500 to-blue-600"
                }`}
              />
            </div>
          </div>
        </div>

        {isShared && (
          <div className="mt-6 text-xs text-stone-500 font-light text-center zen-text">
            <div className="bg-white/60 px-2 py-1 rounded backdrop-blur-sm inline-block">
              下一回合輪到
              <span
                className={`ml-1 zen-text font-medium ${
                  card.color === "red" ? "text-red-600" : "text-blue-600"
                }`}
              >
                {card.color === "red" ? "紅方" : "藍方"}
              </span>
            </div>
          </div>
        )}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

// The main component is now a simple wrapper
export default function MoveCards({
  redCards,
  blueCards,
  sharedCard,
  currentPlayer,
  selectedCardIndex,
  onCardClick,
}: {
  redCards: MoveCard[];
  blueCards: MoveCard[];
  sharedCard: MoveCard;
  currentPlayer: Player;
  selectedCardIndex: number | null;
  onCardClick: (cardIndex: number, player: Player) => void;
}) {
  const sharedCardPosition =
    sharedCard.color === "blue" ? "shared-left" : "shared-right";

  return (
    <>
      {/* Blue Player's Cards */}
      <Card
        card={blueCards[0]}
        gridArea="blue-left"
        isSelected={currentPlayer === "blue" && selectedCardIndex === 0}
        playerOwner="blue"
        currentPlayer={currentPlayer}
        cardIndex={0}
        onCardClick={onCardClick}
      />
      <Card
        card={blueCards[1]}
        gridArea="blue-right"
        isSelected={currentPlayer === "blue" && selectedCardIndex === 1}
        playerOwner="blue"
        currentPlayer={currentPlayer}
        cardIndex={1}
        onCardClick={onCardClick}
      />

      {/* Red Player's Cards */}
      <Card
        card={redCards[0]}
        gridArea="red-left"
        isSelected={currentPlayer === "red" && selectedCardIndex === 0}
        playerOwner="red"
        currentPlayer={currentPlayer}
        cardIndex={0}
        onCardClick={onCardClick}
      />
      <Card
        card={redCards[1]}
        gridArea="red-right"
        isSelected={currentPlayer === "red" && selectedCardIndex === 1}
        playerOwner="red"
        currentPlayer={currentPlayer}
        cardIndex={1}
        onCardClick={onCardClick}
      />

      {/* Shared Card */}
      <Card
        card={sharedCard}
        gridArea={sharedCardPosition}
        isSelected={false} // Shared card is never selected
        playerOwner="shared"
        currentPlayer={currentPlayer}
        onCardClick={() => {}} // No action
      />
    </>
  );
}
