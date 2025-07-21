"use client";

import { motion, AnimatePresence } from "motion/react";
import { MoveCard, Player } from "@/types/game";

interface MoveCardsProps {
  cards: MoveCard[];
  player: Player;
  onCardClick: (cardIndex: number) => void;
  isCurrentPlayer: boolean;
  selectedCard?: number | null;
}

const animalKanji = {
  Tiger: "虎",
  Dragon: "龍",
  Frog: "蛙",
  Rabbit: "兎",
  Crab: "蟹",
  Crane: "鶴",
  Elephant: "象",
  Mantis: "螳",
  Boar: "猪",
  Horse: "馬",
  Ox: "牛",
  Goose: "雁",
  Rooster: "鶏",
  Monkey: "猿",
  Eel: "鰻",
  Cobra: "蛇",
};

export default function MoveCards({
  cards,
  player,
  onCardClick,
  isCurrentPlayer,
  selectedCard,
}: MoveCardsProps) {
  const playerColor = player === "player1" ? "blue" : "red";

  return (
    <motion.div
      className={`flex flex-col items-center space-y-6 ${
        isCurrentPlayer ? "opacity-100" : "opacity-75"
      }`}
      initial={{ opacity: 0, y: player === "player1" ? 30 : -30 }}
      animate={{ opacity: isCurrentPlayer ? 1 : 0.75, y: 0 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
    >
      {/* Player title with Japanese aesthetics */}
      <motion.div
        className={`text-center space-y-2 ${
          isCurrentPlayer ? "scale-105" : "scale-100"
        }`}
        style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
        animate={{ scale: isCurrentPlayer ? 1.05 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className={`text-lg font-semibold ${
            player === "player1" ? "text-blue-700" : "text-red-700"
          }`}
        >
          {player === "player1" ? "青の戦士" : "赤の戦士"}
        </div>
        <div
          className={`text-sm opacity-80 ${
            player === "player1" ? "text-blue-600" : "text-red-600"
          }`}
        >
          {player === "player1" ? "Blue Warrior" : "Red Warrior"}
        </div>
      </motion.div>

      {/* Tarot-sized cards with premium aesthetics */}
      <div className="flex gap-6 justify-center">
        <AnimatePresence mode="popLayout">
          {cards.map((card, index) => {
            const isSelected = selectedCard === index;
            const cardRotation = player === "player1" ? 0 : 180;

            return (
              <motion.div
                key={`${card.name}-${index}`}
                onClick={() => onCardClick(index)}
                className={`
                  zen-card cursor-pointer transition-all duration-500 rounded-2xl overflow-hidden
                  w-28 h-40 relative group
                  ${
                    isSelected
                      ? "ring-4 ring-yellow-400 scale-105 z-10"
                      : "hover:scale-102"
                  }
                  ${isCurrentPlayer ? "hover:shadow-2xl" : ""}
                `}
                style={{
                  transform: `rotate(${cardRotation}deg)`,
                  transformStyle: "preserve-3d",
                }}
                initial={{
                  opacity: 0,
                  x: player === "player1" ? 80 : -80,
                  rotateY: -90,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  rotateY: 0,
                  scale: isSelected ? 1.05 : 1,
                }}
                exit={{
                  opacity: 0,
                  x: player === "player1" ? -80 : 80,
                  rotateY: 90,
                }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 200,
                }}
                whileHover={{
                  scale: isCurrentPlayer ? (isSelected ? 1.08 : 1.02) : 1,
                  rotateZ: isCurrentPlayer
                    ? player === "player1"
                      ? 2
                      : -2
                    : 0,
                  y: isCurrentPlayer ? -4 : 0,
                }}
                whileTap={{ scale: 0.98 }}
                layout
              >
                {/* Card background with traditional pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-amber-50" />

                {/* Traditional border pattern */}
                <div className="absolute inset-2 border border-amber-200/60 rounded-xl">
                  <div className="absolute inset-1 border border-amber-300/40 rounded-lg" />
                </div>

                {/* Card content */}
                <div className="relative z-10 h-full flex flex-col p-4">
                  {/* Animal name in Japanese */}
                  <div className="text-center mb-3">
                    <div
                      className="text-2xl font-bold text-amber-800 mb-1"
                      style={{ fontFamily: '"Noto Serif JP", serif' }}
                    >
                      {animalKanji[card.name as keyof typeof animalKanji] ||
                        card.name[0]}
                    </div>
                    <div
                      className="text-xs font-medium text-amber-700 tracking-wide"
                      style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
                    >
                      {card.name}
                    </div>
                  </div>

                  {/* Movement pattern with traditional grid */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-100/80 to-amber-50 rounded-lg border border-amber-200/80 grid grid-cols-3 gap-1 p-2 shadow-inner">
                      {card.pattern.map((row, i) =>
                        row.map((cell, j) => (
                          <motion.div
                            key={`${i}-${j}`}
                            className={`
                              w-4 h-4 rounded-sm transition-all duration-300
                              ${
                                cell === "X"
                                  ? playerColor === "blue"
                                    ? "bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm"
                                    : "bg-gradient-to-br from-red-400 to-red-600 shadow-sm"
                                  : ""
                              }
                              ${
                                cell === "O"
                                  ? "bg-gradient-to-br from-amber-600 to-amber-700 shadow-sm border border-amber-800/20"
                                  : ""
                              }
                              ${
                                cell === " "
                                  ? "bg-amber-100/60 border border-amber-200/40"
                                  : ""
                              }
                            `}
                            initial={{ scale: 0, rotate: 180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              duration: 0.5,
                              delay: (i * 3 + j) * 0.03 + index * 0.1,
                              type: "spring",
                              stiffness: 400,
                            }}
                            whileHover={{
                              scale: cell !== " " ? 1.1 : 1,
                              rotate: cell === "O" ? 360 : 0,
                            }}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Player color indicator */}
                  <div className="flex justify-center mt-2">
                    <div
                      className={`
                      w-2 h-2 rounded-full shadow-sm
                      ${
                        playerColor === "blue"
                          ? "bg-gradient-to-br from-blue-400 to-blue-600"
                          : "bg-gradient-to-br from-red-400 to-red-600"
                      }
                    `}
                    />
                  </div>
                </div>

                {/* Selection glow effect */}
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-yellow-300/30 to-yellow-400/20 pointer-events-none rounded-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                {/* Elegant hover effect for current player */}
                {isCurrentPlayer && (
                  <motion.div
                    className={`
                      absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100
                      ${
                        playerColor === "blue"
                          ? "bg-gradient-to-br from-blue-400/10 to-blue-600/15"
                          : "bg-gradient-to-br from-red-400/10 to-red-600/15"
                      }
                    `}
                    transition={{ duration: 0.3 }}
                  />
                )}

                {/* Premium card shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-2xl pointer-events-none" />

                {/* Subtle shadow for depth */}
                <div className="absolute -inset-1 bg-gradient-to-b from-transparent to-black/5 rounded-2xl -z-10 blur-sm" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Current player indicator */}
      {isCurrentPlayer && (
        <motion.div
          className="flex items-center space-x-2 text-sm font-medium"
          style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className={`w-3 h-3 rounded-full ${
              playerColor === "blue"
                ? "bg-gradient-to-br from-blue-400 to-blue-600"
                : "bg-gradient-to-br from-red-400 to-red-600"
            } shadow-lg`}
            animate={{
              scale: [1, 1.2, 1],
              boxShadow:
                playerColor === "blue"
                  ? [
                      "0 0 5px rgba(59, 130, 246, 0.5)",
                      "0 0 15px rgba(59, 130, 246, 0.8)",
                      "0 0 5px rgba(59, 130, 246, 0.5)",
                    ]
                  : [
                      "0 0 5px rgba(239, 68, 68, 0.5)",
                      "0 0 15px rgba(239, 68, 68, 0.8)",
                      "0 0 5px rgba(239, 68, 68, 0.5)",
                    ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span
            className={`${
              playerColor === "blue" ? "text-blue-700" : "text-red-700"
            }`}
          >
            あなたの番 (Your Turn)
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
