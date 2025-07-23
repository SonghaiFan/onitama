"use client";

import React from "react";
import { motion } from "framer-motion";
import { MoveCard, Player } from "@/types/game";
import { getArtName } from "../utils/getArtName";

type Language = "zh" | "en";

// Bilingual content for card components
const cardContent = {
  zh: {
    sharedCard: "交換區",
    nextTurn: "下一回合換給",
    redPlayer: "紅方",
    bluePlayer: "藍方",
  },
  en: {
    sharedCard: "Exchange Area",
    nextTurn: "Next turn to",
    redPlayer: "Red",
    bluePlayer: "Blue",
  },
};

interface CardProps {
  card: MoveCard;
  gridArea: string;
  isSelected: boolean;
  playerOwner: Player | "shared";
  currentPlayer: Player;
  cardIndex?: number;
  onCardClick: (cardIndex: number, player: Player) => void;
  language?: Language;
}

// Separate component for the move grid
function MoveGrid({ card, isRotated }: { card: MoveCard; isRotated: boolean }) {
  return (
    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 mx-auto bg-stone-100/95 border border-stone-300 grid grid-cols-5 gap-0.5 p-1 backdrop-blur-sm shadow-inner">
      {Array.from({ length: 5 }, (_, i) =>
        Array.from({ length: 5 }, (_, j) => {
          const actualI = isRotated ? 4 - i : i;
          const actualJ = isRotated ? 4 - j : j;

          if (actualI === 2 && actualJ === 2) {
            return (
              <div
                key={`${i}-${j}`}
                className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 border border-stone-400 bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center shadow-sm"
              />
            );
          }

          const hasMove = card.moves.some((move) => {
            let displayMove = move;
            if (isRotated) {
              displayMove = { x: move.x, y: -move.y };
            }

            const displayRow = 2 - displayMove.y;
            const displayCol = 2 + displayMove.x;
            return displayRow === actualI && displayCol === actualJ;
          });

          return (
            <div
              key={`${i}-${j}`}
              className={`w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 border border-stone-300 transition-colors ${
                hasMove
                  ? "bg-emerald-400/80 shadow-sm"
                  : "bg-stone-50 hover:bg-stone-100"
              }`}
            />
          );
        })
      )}
    </div>
  );
}

// Main card component - simplified and focused
export function Card({
  card,
  gridArea,
  isSelected,
  playerOwner,
  currentPlayer,
  cardIndex,
  onCardClick,
}: CardProps) {
  const isBlue = playerOwner === "blue";
  const isRed = playerOwner === "red";
  const isShared = playerOwner === "shared";
  const isRotated = isBlue || (isShared && gridArea === "shared-left");
  const canInteract = !isShared && playerOwner === currentPlayer;

  const handleClick = () => {
    if (canInteract && cardIndex !== undefined) {
      onCardClick(cardIndex, playerOwner as Player);
    }
  };

  return (
    <motion.div
      style={{ gridArea }}
      animate={{
        rotate: isRotated ? 180 : 0,
        scale: isSelected ? 1.05 : 1,
        boxShadow: isSelected
          ? "0 0 20px rgba(251, 191, 36, 0.6)"
          : isShared
          ? "0 4px 12px rgba(147, 51, 234, 0.2)"
          : "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
      whileHover={{
        scale: canInteract ? (isSelected ? 1.08 : 1.03) : 1,
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
      <div
        className={`zen-card relative overflow-hidden ${
          isShared ? "p-1.5 sm:p-2 md:p-3" : "p-1.5 sm:p-2"
        } border border-stone-300`}
      >
        {/* Decorative Corner Elements */}
        <div className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 border-l border-t border-stone-300/50 pointer-events-none"></div>
        <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 border-r border-t border-stone-300/50 pointer-events-none"></div>
        <div className="absolute bottom-0.5 left-0.5 sm:bottom-1 sm:left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 border-l border-b border-stone-300/50 pointer-events-none"></div>
        <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 border-r border-b border-stone-300/50 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex flex-col items-center justify-center mb-1.5 sm:mb-2 md:mb-3">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full bg-stone-100/90 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] ring-1 ring-stone-300">
              {getArtName(card)}
            </div>
            <div className="text-[8px] sm:text-[10px] text-stone-600 mt-0.5 text-center">
              {card.name}
            </div>
          </div>

          <MoveGrid card={card} isRotated={isRotated} />

          <div className="flex justify-center mt-1.5 sm:mt-2 md:mt-3">
            <div
              className={`w-6 h-1 sm:w-8 sm:h-1.5 shadow-sm ${
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
    </motion.div>
  );
}

// Export the Card component as default
export default Card;
