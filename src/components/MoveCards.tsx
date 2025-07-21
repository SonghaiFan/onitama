"use client";

import { motion } from "framer-motion";
import { MoveCard, Player } from "@/types/game";

interface MoveCardsProps {
  cards: MoveCard[];
  player: Player;
  onCardClick: (cardIndex: number) => void;
  isCurrentPlayer: boolean;
  selectedCard?: number | null;
}

export default function MoveCards({
  cards,
  player,
  onCardClick,
  isCurrentPlayer,
  selectedCard,
}: MoveCardsProps) {
  const playerColor = player === "red" ? "red" : "blue";

  return (
    <div
      className={`space-y-3 ${isCurrentPlayer ? "opacity-100" : "opacity-60"}`}
    >
      <div className="text-center mb-2">
        <div className={`flex items-center justify-center space-x-2 ${
          player === "red" ? "text-red-800" : "text-blue-800"
        }`}>
          <div className={`w-4 h-4 rounded-full ${
            player === "red" ? "bg-red-800" : "bg-blue-800"
          }`}></div>
          <span className="font-light tracking-wide">
            {player === "red" ? "紅方牌組" : "蓝方牌組"}
          </span>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        {cards.map((card, index) => (
          <motion.div
            key={`${player}-${index}-${card.name}`}
            onClick={() => onCardClick(index)}
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
              scale: selectedCard === index ? 1.05 : 1
            }}
            whileHover={{ 
              scale: isCurrentPlayer ? 1.08 : 1,
              y: isCurrentPlayer ? -4 : 0,
              transition: { type: "spring", stiffness: 400, damping: 10 }
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ 
              duration: 0.3,
              delay: index * 0.1
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
        ))}
      </div>
    </div>
  );
}
