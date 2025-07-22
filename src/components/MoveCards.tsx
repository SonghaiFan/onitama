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
          zen-card p-3 sm:p-4 border select-none w-32 md:w-36 lg:w-40
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
          ${canInteract ? "cursor-pointer" : "cursor-default"}
        `}
        animate={{
          rotate: isRotated ? 180 : 0,
          scale: isSelected ? 1.05 : 1,
        }}
        whileHover={{ scale: canInteract ? 1.08 : 1 }}
        whileTap={{ scale: canInteract ? 0.95 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={handleClick}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          duration: 0.8,
        }}
      >
        {isShared && (
          <>
            <motion.div
              className="text-sm sm:text-lg font-light text-stone-800 mb-3 sm:mb-4 tracking-wide text-center"
              animate={{ rotate: isRotated ? 180 : 0 }}
              transition={{ duration: 0.6 }}
            >
              共用牌
            </motion.div>
            <div className="w-8 sm:w-12 h-px bg-stone-300 mx-auto mb-4 sm:mb-6"></div>
          </>
        )}

        <div
          className={`zen-card ${
            isShared ? "p-2 sm:p-3" : "p-0"
          } border border-stone-300`}
        >
          <div className="text-xs font-light text-center mb-2 sm:mb-3 text-stone-800 bg-stone-100/80 py-1 px-1 sm:px-2 border border-stone-200">
            {card.name}
          </div>

          <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 mx-auto bg-stone-100/90 border border-stone-300 grid grid-cols-5 gap-0.5 p-1">
            {Array.from({ length: 5 }, (_, i) =>
              Array.from({ length: 5 }, (_, j) => {
                const actualI = isRotated ? 4 - i : i;
                const actualJ = isRotated ? 4 - j : j;

                if (actualI === 2 && actualJ === 2) {
                  return (
                    <div
                      key={`${i}-${j}`}
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 border border-stone-300 bg-stone-800 flex items-center justify-center"
                    >
                      <span className="text-[8px] sm:text-[10px] text-stone-100">
                        中
                      </span>
                    </div>
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
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 border border-stone-300 ${
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

          <div className="flex justify-center mt-2 sm:mt-3">
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
            />
          </div>
        </div>

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
