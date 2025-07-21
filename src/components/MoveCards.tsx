"use client";

import { motion } from "framer-motion";
import { MoveCard, Player } from "@/types/game";

interface CardData {
  card: MoveCard;
  position: string;
  isSelected: boolean;
}

interface MoveCardsProps {
  cards?: MoveCard[];
  player?: Player;
  onCardClick?: (cardIndex: number) => void;
  isCurrentPlayer?: boolean;
  selectedCard?: number | null;
  // New props for universal card system
  allCards?: CardData[];
  currentPlayer?: Player;
  onUniversalCardClick?: (cardIndex: number, player: Player) => void;
  isUniversal?: boolean;
}

export default function MoveCards({
  cards,
  player,
  onCardClick,
  isCurrentPlayer,
  selectedCard,
  allCards,
  currentPlayer,
  onUniversalCardClick,
  isUniversal = false,
}: MoveCardsProps) {
  // Universal Card Component
  const UniversalCard = ({ cardData }: { cardData: CardData }) => {
    const { card, position, isSelected } = cardData;
    const isShared = position.startsWith("shared");
    const isBlue = position.startsWith("blue");
    const isRed = position.startsWith("red");
    const isRotated = isBlue || (isShared && position === "shared-left");

    // Get responsive classes for different screen sizes
    const getResponsiveClasses = (pos: string) => {
      const baseClasses =
        "absolute zen-card p-3 sm:p-4 border cursor-pointer select-none";
      const sizeClasses = isShared
        ? "p-4 sm:p-6 w-28 sm:w-32 md:w-36 lg:w-40"
        : "w-24 sm:w-28 md:w-30 lg:w-32";

      // Responsive positioning using viewport and percentage units
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

      return `${baseClasses} ${sizeClasses} ${
        positionClasses[pos as keyof typeof positionClasses] ||
        "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      }`;
    };

    const handleClick = () => {
      if (isShared || !onUniversalCardClick || !currentPlayer) return;

      if (isRed && currentPlayer === "red") {
        const cardIndex = position === "red-left" ? 0 : 1;
        onUniversalCardClick(cardIndex, "red");
      } else if (isBlue && currentPlayer === "blue") {
        const cardIndex = position === "blue-left" ? 0 : 1;
        onUniversalCardClick(cardIndex, "blue");
      }
    };

    return (
      <motion.div
        className={`${getResponsiveClasses(position)}
        ${
          isRed
            ? "border-red-300"
            : isBlue
            ? "border-blue-300"
            : "border-stone-300"
        }
        ${isSelected ? "ring-2 ring-amber-400 border-amber-400 shadow-xl" : ""}
      `}
        style={{
          zIndex: isSelected ? 30 : isShared ? 25 : 15,
        }}
        initial={{ opacity: 0, rotate: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          rotate: isRotated ? 180 : 0,
          scale: isSelected ? 1.05 : 1,
        }}
        whileHover={{
          scale:
            !isShared &&
            ((isRed && currentPlayer === "red") ||
              (isBlue && currentPlayer === "blue"))
              ? 1.06
              : isSelected
              ? 1.05
              : 1,
          transition: { type: "spring", stiffness: 400, damping: 15 },
        }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          duration: 0.8,
        }}
      >
        {/* Card Title for shared cards */}
        {isShared && (
          <motion.div
            className="text-sm sm:text-lg font-light text-stone-800 mb-3 sm:mb-4 tracking-wide text-center"
            animate={{ rotate: isRotated ? 180 : 0 }}
            transition={{ duration: 0.6 }}
          >
            共用牌
          </motion.div>
        )}
        {isShared && (
          <div className="w-8 sm:w-12 h-px bg-stone-300 mx-auto mb-4 sm:mb-6"></div>
        )}
        {/* Card Content */}
        <div
          className={`zen-card ${
            isShared ? "p-2 sm:p-3" : "p-0"
          } border border-stone-300`}
        >
          <div className="text-xs font-light text-center mb-2 sm:mb-3 text-stone-800 bg-stone-100/80 py-1 px-1 sm:px-2 border border-stone-200">
            {card.name}
          </div>

          {/* 5x5 Grid Display - Responsive */}
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
                  const displayRow = 2 - move.y;
                  const displayCol = 2 + move.x;
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

          {/* Color Indicator */}
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
            ></div>
          </div>
        </div>{" "}
        {/* Shared card next turn indicator */}
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
  };

  // Traditional Card Component (original logic)
  const TraditionalCard = ({
    card,
    index,
  }: {
    card: MoveCard;
    index: number;
  }) => {
    const playerColor = player === "red" ? "red" : "blue";

    return (
      <motion.div
        key={`${player}-${index}-${card.name}`}
        onClick={() => onCardClick?.(index)}
        className={`
          relative zen-card p-4 border cursor-pointer 
          ${isCurrentPlayer ? "hover:border-amber-400" : ""}
          ${playerColor === "red" ? "border-red-300" : "border-blue-300"}
          ${
            selectedCard === index
              ? "ring-2 ring-amber-400 border-amber-400 shadow-xl"
              : ""
          }
          w-32
        `}
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: selectedCard === index ? 1.05 : 1,
        }}
        whileHover={{
          scale: isCurrentPlayer ? 1.08 : 1,
          y: isCurrentPlayer ? -4 : 0,
          transition: { type: "spring", stiffness: 400, damping: 10 },
        }}
        whileTap={{ scale: 0.95 }}
        transition={{
          duration: 0.3,
          delay: index * 0.1,
        }}
      >
        {/* Card Name */}
        <div className="text-xs font-light text-center mb-3 text-stone-800 bg-stone-100/80 py-1 px-2 border border-stone-200">
          {card.name}
        </div>

        {/* 5x5 Card Pattern Display - Zen Style */}
        <div className="w-20 h-20 mx-auto grid grid-cols-5 gap-0.5 p-1 bg-stone-100/90 border border-stone-300">
          {Array.from({ length: 5 }, (_, i) =>
            Array.from({ length: 5 }, (_, j) => {
              // Center position
              if (i === 2 && j === 2) {
                return (
                  <div
                    key={`${i}-${j}`}
                    className="w-3 h-3 border border-stone-300 bg-stone-800 flex items-center justify-center"
                  >
                    <span className="text-[10px] text-stone-100">中</span>
                  </div>
                );
              }

              // Check if this position has a move
              const hasMove = card.moves.some((move) => {
                const displayRow = 2 - move.y;
                const displayCol = 2 + move.x;
                return displayRow === i && displayCol === j;
              });

              return (
                <div
                  key={`${i}-${j}`}
                  className={`
                    w-3 h-3 border border-stone-300
                    ${
                      hasMove
                        ? playerColor === "red"
                          ? "bg-red-600"
                          : "bg-emerald-600"
                        : "bg-stone-50"
                    }
                  `}
                />
              );
            })
          )}
        </div>

        {/* Color Indicator - Zen Style */}
        <div className="flex justify-center mt-3">
          <div
            className={`
            w-6 h-1 
            ${playerColor === "red" ? "bg-red-700" : "bg-blue-700"}
          `}
          ></div>
        </div>
      </motion.div>
    );
  };

  // Render based on mode
  if (isUniversal && allCards) {
    // Universal card system - render all cards with absolute positioning
    return (
      <div className="relative">
        {allCards.map((cardData) => (
          <UniversalCard
            key={`${cardData.card.name}-${cardData.position}`}
            cardData={cardData}
          />
        ))}
      </div>
    );
  }

  // Traditional card system
  if (!cards || !player) return null;

  return (
    <div
      className={`space-y-3 ${isCurrentPlayer ? "opacity-100" : "opacity-60"}`}
    >
      <div className="text-center mb-2">
        <div
          className={`flex items-center justify-center space-x-2 ${
            player === "red" ? "text-red-800" : "text-blue-800"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full ${
              player === "red" ? "bg-red-800" : "bg-blue-800"
            }`}
          ></div>
          <span className="font-light tracking-wide">
            {player === "red" ? "紅方牌組" : "蓝方牌組"}
          </span>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        {cards.map((card, index) => (
          <TraditionalCard key={index} card={card} index={index} />
        ))}
      </div>
    </div>
  );
}
