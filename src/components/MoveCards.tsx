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
      <div
        className={`text-center font-bold text-sm ${
          player === "red" ? "text-red-600" : "text-blue-600"
        }`}
      >
        {player === "red" ? "Red Player Cards" : "Blue Player Cards"}
      </div>

      <div className="flex gap-3 justify-center">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => onCardClick(index)}
            className={`
              relative bg-gradient-to-br from-amber-50 to-orange-100 p-4 rounded-lg border-2 cursor-pointer 
              transition-all duration-200 hover:scale-105 hover:shadow-lg
              ${isCurrentPlayer ? "hover:border-yellow-400" : ""}
              ${playerColor === "red" ? "border-red-400" : "border-blue-400"}
              ${
                selectedCard === index
                  ? "ring-2 ring-yellow-400 border-yellow-400 shadow-lg"
                  : ""
              }
              min-w-[120px]
            `}
          >
            {/* Card Name */}
            <div className="text-xs font-bold text-center mb-3 text-gray-800 bg-white/70 py-1 px-2 rounded">
              {card.name}
            </div>

            {/* 5x5 Card Pattern Display - Like Real Onitama Cards */}
            <div className="w-20 h-20 mx-auto grid grid-cols-5 gap-0.5 p-1 bg-white/90 rounded border border-gray-300">
              {Array.from({ length: 5 }, (_, i) =>
                Array.from({ length: 5 }, (_, j) => {
                  // Center position
                  if (i === 2 && j === 2) {
                    return (
                      <div
                        key={`${i}-${j}`}
                        className="w-3 h-3 border border-gray-200 bg-gray-800"
                      />
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
                        w-3 h-3 border border-gray-200
                        ${
                          hasMove
                            ? playerColor === "red"
                              ? "bg-red-500"
                              : "bg-green-500"
                            : "bg-gray-50"
                        }
                      `}
                    />
                  );
                })
              )}
            </div>

            {/* Color Indicator - Like Real Cards */}
            <div className="flex justify-center mt-2">
              <div
                className={`
                w-4 h-2 rounded-sm
                ${playerColor === "red" ? "bg-red-600" : "bg-blue-600"}
              `}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
