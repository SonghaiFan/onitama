"use client";

import React from "react";
import { motion } from "framer-motion";
import { MoveCard, Player } from "@/types/game";
import { getArtName } from "../utils/getArtName";

interface CardProps {
  card: MoveCard;
  gridArea: string;
  isSelected: boolean;
  playerOwner: Player | "shared";
  currentPlayer: Player;
  cardIndex?: number;
  onCardClick: (cardIndex: number, player: Player) => void;
}

// Separate component for the move grid
function MoveGrid({ card, isRotated }: { card: MoveCard; isRotated: boolean }) {
  return (
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
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 border border-stone-300 transition-colors ${
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

// Separate component for card header (shared card label)
function CardHeader({ isShared }: { isShared: boolean }) {
  if (!isShared) return null;

  return (
    <>
      <div className="text-sm sm:text-lg font-light text-stone-800 mb-3 sm:mb-4 tracking-wide text-center zen-text relative">
        <span className="bg-white/80 px-2 py-1 rounded backdrop-blur-sm">
          共用牌
        </span>
      </div>
      <div className="brush-stroke mx-auto mb-4 sm:mb-6"></div>
    </>
  );
}

// Separate component for card footer (shared card info)
function CardFooter({ isShared, card }: { isShared: boolean; card: MoveCard }) {
  if (!isShared) return null;

  return (
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

  const getCardStyles = () => {
    const baseStyles =
      "zen-card scroll-paper p-3 sm:p-4 border select-none w-32 md:w-36 lg:w-40 relative overflow-hidden";

    const colorStyles = isRed
      ? "border-red-300 shadow-red-100"
      : isBlue
      ? "border-blue-300 shadow-blue-100"
      : "border-stone-300";

    const selectionStyles = isSelected ? "shadow-xl shadow-amber-200/50" : "";

    const interactionStyles = canInteract
      ? "cursor-pointer hover:shadow-lg focus:focus-zen"
      : "cursor-default";

    const disabledStyles =
      !canInteract && !isShared ? "opacity-40 grayscale" : "";

    return `${baseStyles} ${colorStyles} ${selectionStyles} ${interactionStyles} ${disabledStyles}`.trim();
  };

  return (
    <motion.div
      style={{ gridArea }}
      className={getCardStyles()}
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
      <CardHeader isShared={isShared} />

      <div
        className={`zen-card relative overflow-hidden ${
          isShared ? "p-2 sm:p-3" : "p-2"
        } border border-stone-300`}
      >
        {/* Decorative Corner Elements */}
        <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-stone-300/50 pointer-events-none"></div>
        <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-stone-300/50 pointer-events-none"></div>
        <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-stone-300/50 pointer-events-none"></div>
        <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-stone-300/50 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex flex-col items-center justify-center mb-2 sm:mb-3">
            <div className="flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-stone-100/90 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] ring-1 ring-stone-300">
              {getArtName(card)}
            </div>
            <div className="text-[10px] text-stone-600 mt-0.5 text-center">
              {card.name}
            </div>
          </div>

          <MoveGrid card={card} isRotated={isRotated} />

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

      <CardFooter isShared={isShared} card={card} />
    </motion.div>
  );
}

// Export the Card component as default
export default Card;
