"use client";

import React from "react";
import { motion } from "framer-motion";
import { MoveCard, Player } from "@/types/game";

interface CardData {
  card: MoveCard;
  position: string;
  isSelected: boolean;
}

interface MoveCardsProps {
  cards: CardData[];
  currentPlayer: Player;
  onCardClick: (cardIndex: number, player: Player) => void;
}

const Card = React.memo(
  ({
    cardData,
    currentPlayer,
    onCardClick,
  }: {
    cardData: CardData;
    currentPlayer: Player;
    onCardClick: (cardIndex: number, player: Player) => void;
  }) => {
    const { card, position, isSelected } = cardData;
    const isShared = position.startsWith("shared");
    const isBlue = position.startsWith("blue");
    const isRed = position.startsWith("red");
    const isRotated = isBlue || (isShared && position === "shared-left");

    const positionClasses = {
      "red-left":
        "left-[calc(50%-6rem)] top-[calc(50%+12rem)] sm:left-[calc(50%-7rem)] sm:top-[calc(50%+14rem)] lg:left-[calc(50%-8rem)] lg:top-[calc(50%+16rem)]",
      "red-right":
        "left-[calc(50%+2rem)] top-[calc(50%+12rem)] sm:left-[calc(50%+3rem)] sm:top-[calc(50%+14rem)] lg:left-[calc(50%+4rem)] lg:top-[calc(50%+16rem)]",
      "blue-left":
        "left-[calc(50%-6rem)] top-[calc(50%-16rem)] sm:left-[calc(50%-7rem)] sm:top-[calc(50%-18rem)] lg:left-[calc(50%-8rem)] lg:top-[calc(50%-20rem)]",
      "blue-right":
        "left-[calc(50%+2rem)] top-[calc(50%-16rem)] sm:left-[calc(50%+3rem)] sm:top-[calc(50%-18rem)] lg:left-[calc(50%+4rem)] lg:top-[calc(50%-20rem)]",
      "shared-left":
        "left-[calc(50%-18rem)] top-[calc(50%-1rem)] sm:left-[calc(50%-22rem)] lg:left-[calc(50%-26rem)]",
      "shared-right":
        "left-[calc(50%+14rem)] top-[calc(50%-1rem)] sm:left-[calc(50%+18rem)] lg:left-[calc(50%+22rem)]",
    };

    const sizeClasses = isShared
      ? "p-4 sm:p-6 w-28 sm:w-32 md:w-36 lg:w-40"
      : "w-24 sm:w-28 md:w-30 lg:w-32";

    const handleClick = () => {
      if (isShared) return;

      if (isRed && currentPlayer === "red") {
        const cardIndex = position === "red-left" ? 0 : 1;
        onCardClick(cardIndex, "red");
      } else if (isBlue && currentPlayer === "blue") {
        const cardIndex = position === "blue-left" ? 0 : 1;
        onCardClick(cardIndex, "blue");
      }
    };

    const canInteract =
      !isShared &&
      ((isRed && currentPlayer === "red") ||
        (isBlue && currentPlayer === "blue"));

    return (
      <motion.div
        className={`
        absolute zen-card p-3 sm:p-4 border cursor-pointer select-none
        ${sizeClasses}
        ${
          positionClasses[position as keyof typeof positionClasses] ||
          "left-1/2 top-1/2"
        }
        ${
          isRed
            ? "border-red-300"
            : isBlue
            ? "border-blue-300"
            : "border-stone-300"
        }
        ${isSelected ? "ring-2 ring-amber-400 border-amber-400 shadow-xl" : ""}
      `}
        style={{ zIndex: isSelected ? 30 : isShared ? 25 : 15 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          rotate: isRotated ? 180 : 0,
          scale: isSelected ? 1.05 : 1,
        }}
        whileHover={{
          scale: canInteract ? 1.06 : isSelected ? 1.05 : 1,
          transition: { type: "spring", stiffness: 400, damping: 15 },
        }}
        whileTap={{ scale: canInteract ? 0.95 : 1 }}
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
              className={`w-4 sm:w-6 h-1 ${
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

export default function MoveCards({
  cards,
  currentPlayer,
  onCardClick,
}: MoveCardsProps) {
  return (
    <div className="relative">
      {cards.map((cardData) => (
        <Card
          key={`${cardData.card.name}-${cardData.position}`}
          cardData={cardData}
          currentPlayer={currentPlayer}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
}
