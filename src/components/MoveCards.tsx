"use client";

import React from "react";
import { motion } from "framer-motion";
import { MoveCard, Player } from "@/types/game";
import { getArtName } from "../utils/getArtName";
import { MoveGrid } from "./MoveGrid";

type Language = "zh" | "en";

// Card content is now handled by SVG symbols

interface CardProps {
  card: MoveCard;
  gridArea: string;
  isSelected: boolean;
  playerOwner: Player | "shared";
  currentPlayer: Player;
  cardIndex?: number;
  onCardClick: (cardIndex: number, player: Player) => void;
  language?: Language;
  isDualMoveInProgress?: boolean;
}

// Main card component
export function Card({
  card,
  gridArea,
  isSelected,
  playerOwner,
  currentPlayer,
  cardIndex,
  onCardClick,
  isDualMoveInProgress = false,
}: CardProps) {
  const isBlue = playerOwner === "blue";
  const isShared = playerOwner === "shared";
  const isRotated = isBlue || (isShared && gridArea === "shared-left");
  const canInteract = !isShared && playerOwner === currentPlayer;

  const handleClick = () => {
    if (canInteract && cardIndex !== undefined) {
      onCardClick(cardIndex, playerOwner as Player);
    }
  };

  // Create a layoutId that helps track cards across positions
  const layoutId = `card-${card.name}`;

  return (
    <motion.div
      key={`${card.name}-${playerOwner}-${gridArea}`}
      style={{ gridArea }}
      className={`zen-card relative aspect-[1.6] overflow-hidden select-none cursor-pointer z-20 flex items-center justify-center bg-white border rounded-lg p-1 sm:p-3 lg:p-6 ${
        isShared ? "opacity-60" : ""
      }`}
      layout
      layoutId={layoutId}
      initial={false}
      animate={{
        rotate: isRotated ? 180 : 0,
        scale: isSelected ? 1.05 : 1,
        boxShadow:
          isDualMoveInProgress && playerOwner === currentPlayer
            ? "0 0 25px rgba(251, 191, 36, 0.8)"
            : isSelected
            ? "0 0 20px rgba(251, 191, 36, 0.6)"
            : "0 4px 12px rgba(147, 51, 234, 0.2)",
        opacity: isShared ? 0.3 : 1,
      }}
      whileHover={{
        scale: canInteract ? (isSelected ? 1.2 : 1.1) : 1,
        opacity: isShared ? 0.8 : 1,
      }}
      whileTap={{ scale: canInteract ? 0.95 : 1 }}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && canInteract && handleClick()}
      tabIndex={canInteract ? 0 : -1}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        layout: {
          type: "spring",
          stiffness: 400,
          damping: 25,
          duration: 0.5,
        },
      }}
    >
      {/* Main content area - 50/50 split */}
      <div className="flex-1 flex items-center ">
        {/* Left section - Character and name (50%) */}
        <div className="w-1/2 h-full flex flex-col items-center justify-center px-2 sm:px-3 space-y-2 sm:space-y-3">
          <div
            className={`flex items-center justify-center mt-5 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-full ring-1 ring-stone-300 `}
          >
            {getArtName(card, "lg")}
          </div>
          <div className="text-sm sm:text-base text-center">{card.name}</div>
        </div>

        {/* Right section - Move grid(s) (50%) */}
        <div className="w-1/2 h-full flex items-center justify-center mx-2">
          {card.isWindCard ? (
            <div className="flex flex-col items-center justify-center w-full ">
              <div className="flex flex-col items-center space-y-1">
                <MoveGrid
                  card={card}
                  isMaster={true}
                  isStudent={true}
                  isTrimmed={true}
                />
              </div>
              <div className="flex flex-col items-center space-y-1">
                <MoveGrid card={card} isWind={true} isTrimmed={true} />
              </div>
            </div>
          ) : card.isMockCard ? (
            <div className="flex flex-col items-center justify-center w-full">
              <div className="flex flex-col items-center space-y-1">
                <MoveGrid card={card} isMaster={true} isTrimmed={true} />
              </div>
              <div className="flex flex-col items-center space-y-1">
                <MoveGrid card={card} isStudent={true} isTrimmed={true} />
              </div>
            </div>
          ) : (
            <MoveGrid card={card} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Export the Card component as default
export default Card;
