"use client";

import React from "react";
import { motion } from "framer-motion";
import { MoveCard, Player } from "@/types/game";
import { getArtName } from "../utils/getArtName";
import { MoveGrid } from "./MoveGrid";

type Language = "zh" | "en";

// Bilingual content for card components
const cardContent = {
  zh: {
    regularMoves: "师/徒",
    windMoves: "風",
    masterMoves: "师",
    studentMoves: "徒",
  },
  en: {
    regularMoves: "Master/Student",
    windMoves: "Wind",
    masterMoves: "Master",
    studentMoves: "Student",
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
  language = "en",
  isDualMoveInProgress = false,
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

  // Create a layoutId that helps track cards across positions
  const layoutId = `card-${card.name}`;

  return (
    <motion.div
      key={`${card.name}-${playerOwner}-${gridArea}`}
      style={{ gridArea }}
      className={`relative z-20 ${isShared ? "opacity-60" : ""}`}
      layout
      layoutId={layoutId}
      initial={false}
      animate={{
        rotate: isRotated ? 180 : 0,
        scale: isSelected ? 1.05 : 1,
        boxShadow: isDualMoveInProgress
          ? "0 0 25px rgba(59, 130, 246, 0.8)"
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
      <div
        className={`zen-card relative overflow-hidden w-40 h-28 sm:w-48 sm:h-32 md:w-56 md:h-36 lg:w-64 lg:h-40 border border-stone-300 shadow-lg`}
      >
        {/* Decorative Corner Elements */}
        <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-l border-t border-stone-300/50 pointer-events-none"></div>
        <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-r border-t border-stone-300/50 pointer-events-none"></div>
        <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-l border-b border-stone-300/50 pointer-events-none"></div>
        <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-r border-b border-stone-300/50 pointer-events-none"></div>

        <div className="relative z-10 h-full flex flex-col">
          {/* Main content area - 50/50 split */}
          <div className="flex-1 flex items-center">
            {/* Left section - Character and name (50%) */}
            <div className="w-1/2 h-full flex flex-col items-center justify-center px-2 sm:px-3 space-y-2 sm:space-y-3">
              <div
                className={`flex items-center justify-center mt-5 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-full ring-1 ring-stone-300 `}
              >
                {getArtName(card, "lg")}
              </div>
              <div className="text-sm sm:text-base text-center">
                {card.name}
              </div>
            </div>

            {/* Vertical divider line */}
            <div className="w-px h-full bg-stone-300/50"></div>

            {/* Right section - Move grid(s) (50%) */}
            <div className="w-1/2 h-full flex items-center justify-center px-2 sm:px-3">
              {card.isWindCard ? (
                <div className="flex flex-col items-center justify-center w-full">
                  <div className="flex flex-col items-center space-y-1">
                    <MoveGrid card={card} isWind={false} isTrimmed={true} />
                    <div className="text-xs text-stone-500">
                      {cardContent[language].regularMoves}
                    </div>
                  </div>
                  <div className="flex flex-col items-center space-y-1">
                    <MoveGrid card={card} isWind={true} isTrimmed={true} />
                    <div className="text-xs text-stone-500">
                      {cardContent[language].windMoves}
                    </div>
                  </div>
                </div>
              ) : card.isMockCard ? (
                <div className="flex flex-col items-center justify-center w-full">
                  <div className="flex flex-col items-center space-y-1">
                    <MoveGrid
                      card={card}
                      isDual={true}
                      isMaster={true}
                      isTrimmed={true}
                    />
                    <div className="text-xs text-stone-500">
                      {cardContent[language].masterMoves}
                    </div>
                  </div>
                  <div className="flex flex-col items-center space-y-1">
                    <MoveGrid
                      card={card}
                      isDual={true}
                      isStudent={true}
                      isTrimmed={true}
                    />
                    <div className="text-xs text-stone-500">
                      {cardContent[language].studentMoves}
                    </div>
                  </div>
                </div>
              ) : (
                <MoveGrid card={card} />
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex justify-center ">
            <div
              className={`w-6 h-1 sm:w-8 sm:h-1.5 shadow-sm ${
                isRed
                  ? "bg-gradient-to-r from-red-500 to-red-600"
                  : isBlue
                  ? "bg-gradient-to-r from-blue-500 to-blue-600"
                  : card.color === "red"
                  ? "bg-gradient-to-r from-red-500 to-red-600"
                  : "bg-gradient-to-r from-blue-500 to-blue-600"
              } `}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Export the Card component as default
export default Card;
