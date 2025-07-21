"use client";

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
          player === "red" ? "text-red-800" : "text-stone-800"
        }`}>
          <div className={`w-4 h-4 rounded-full ${
            player === "red" ? "bg-red-800" : "bg-stone-800"
          }`}></div>
          <span className="font-light tracking-wide">
            {player === "red" ? "紅方牌組" : "石方牌組"}
          </span>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => onCardClick(index)}
            className={`
              relative zen-card p-5 border cursor-pointer 
              transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1
              ${isCurrentPlayer ? "hover:border-amber-400" : ""}
              ${playerColor === "red" ? "border-red-300" : "border-stone-300"}
              ${
                selectedCard === index
                  ? "ring-2 ring-amber-400 border-amber-400 shadow-xl scale-105"
                  : ""
              }
              min-w-[140px] zen-float
            `}
          >
            {/* Card Name */}
            <div className="text-sm font-light text-center mb-4 text-stone-800 bg-stone-100/80 py-2 px-3 rounded-none border border-stone-200">
              {card.name}
            </div>

            {/* 5x5 Card Pattern Display - Zen Style */}
            <div className="w-24 h-24 mx-auto grid grid-cols-5 gap-0.5 p-2 bg-stone-100/90 border border-stone-300">
              {Array.from({ length: 5 }, (_, i) =>
                Array.from({ length: 5 }, (_, j) => {
                  // Center position
                  if (i === 2 && j === 2) {
                    return (
                      <div
                        key={`${i}-${j}`}
                        className="w-4 h-4 border border-stone-300 bg-stone-800 flex items-center justify-center"
                      >
                        <span className="text-xs text-stone-100">中</span>
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
                        w-4 h-4 border border-stone-300
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
            <div className="flex justify-center mt-4">
              <div
                className={`
                w-8 h-1 
                ${playerColor === "red" ? "bg-red-700" : "bg-stone-700"}
              `}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
