"use client";
import { MoveCard } from "@/types/game";
import React from "react";

// Separate component for the move grid
export function MoveGrid({
  card,
  isRotated,
  isWind = false,
  isTrimmed = false,
}: {
  card: MoveCard;
  isRotated: boolean;
  isWind?: boolean;
  isTrimmed?: boolean;
}) {
  const movesToShow = isWind && card.wind_move ? card.wind_move : card.moves;

  return (
    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 bg-stone-100/95 border border-stone-300 grid grid-cols-5 grid-rows-5 gap-0.5 p-1 backdrop-blur-sm shadow-inner">
      {Array.from({ length: 5 }, (_, i) =>
        Array.from({ length: 5 }, (_, j) => {
          const actualI = isRotated ? 4 - i : i;
          const actualJ = isRotated ? 4 - j : j;

          if (actualI === 2 && actualJ === 2) {
            return (
              <div
                key={`${i}-${j}`}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 border border-stone-400 flex items-center justify-center shadow-sm ${
                  isWind && card.wind_move
                    ? "bg-gradient-to-br from-cyan-600 to-blue-700"
                    : "bg-gradient-to-br from-stone-700 to-stone-900"
                }`}
              />
            );
          }

          const hasMove = movesToShow.some((move) => {
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
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 border border-stone-300 transition-colors ${
                hasMove
                  ? isWind && card.wind_move
                    ? "bg-cyan-400/80 shadow-sm"
                    : "bg-emerald-400/80 shadow-sm"
                  : "bg-stone-50 hover:bg-stone-100"
              }`}
            />
          );
        })
      )}
    </div>
  );
}
