"use client";
import { MoveCard } from "@/types/game";
import React from "react";

export function MoveGrid({
  card,
  isWind = false,
  isTrimmed = false,
}: {
  card: MoveCard;
  isWind?: boolean;
  isTrimmed?: boolean;
}) {
  // Determine which set of moves to display
  const movesToShow = isWind && card.wind_move ? card.wind_move : card.moves;

  // All potential row and column indices for a 5x5 grid
  const allRowIndices = [0, 1, 2, 3, 4];
  const colIndices = [0, 1, 2, 3, 4];

  // Identify which rows contain any moves (or center if there are moves)
  const rowHasContent = allRowIndices.map((row) => {
    if (row === 2) {
      // Show the center row if there are any moves at all
      return movesToShow.length > 0;
    }
    return movesToShow.some((move) => {
      const displayRow = 2 - move.y;
      return displayRow === row;
    });
  });

  // Slice out empty top/bottom rows if trimming is enabled
  let visibleRowIndices = allRowIndices;
  if (isTrimmed) {
    const first = rowHasContent.findIndex((v) => v);
    const last =
      rowHasContent.length -
      1 -
      [...rowHasContent].reverse().findIndex((v) => v);
    visibleRowIndices = allRowIndices.slice(first, last + 1);
  }

  return (
    <div
      className="w-12 sm:w-14 md:w-16 lg:w-18 bg-stone-100/95 border border-stone-300 grid grid-cols-5 gap-0.5 p-1 backdrop-blur-sm shadow-inner"
      style={{
        gridTemplateRows: `repeat(${visibleRowIndices.length}, minmax(0, 1fr))`,
      }}
    >
      {visibleRowIndices.map((i) =>
        colIndices.map((j) => {
          const isCenter = i === 2 && j === 2;
          if (isCenter) {
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
          // Check if this cell corresponds to a move
          const hasMove = movesToShow.some((move) => {
            const displayRow = 2 - move.y;
            const displayCol = 2 + move.x;
            return displayRow === i && displayCol === j;
          });
          return (
            <div
              key={`${i}-${j}`}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 border transition-colors ${
                hasMove
                  ? isWind && card.wind_move
                    ? "bg-cyan-400/80 shadow-sm"
                    : "bg-emerald-400/80 shadow-sm"
                  : "bg-stone-50 hover:bg-stone-100 border-stone-300"
              }`}
            />
          );
        })
      )}
    </div>
  );
}
