"use client";
import { MoveCard, Move } from "@/types/game";
import React from "react";
import { GameSymbol } from "@/utils/gameSymbol";

// Responsive move grid with optional trimming and no borders; each cell is a square via aspect-square
export function MoveGrid({
  card,
  isWind = false,
  isMaster = false,
  isStudent = false,
  isTrimmed = false,
}: {
  card: MoveCard;
  isWind?: boolean;
  isMaster?: boolean;
  isStudent?: boolean;
  isTrimmed?: boolean;
}) {
  // Determine which moves to show based on card type and parameters
  let movesToShow: Move[];
  switch (true) {
    case isWind && !!card.wind_move:
      movesToShow = card.wind_move!;
      break;
    case isMaster && !!card.master_moves:
      movesToShow = card.master_moves!;
      break;
    case isStudent && !!card.student_moves:
      movesToShow = card.student_moves!;
      break;
    default:
      movesToShow = card.moves;
  }
  const rows = [0, 1, 2, 3, 4];
  const cols = [0, 1, 2, 3, 4];

  // Determine which rows have moves
  const rowHasContent = rows.map((r) =>
    r === 2
      ? movesToShow.length > 0
      : movesToShow.some((move) => 2 - move.y === r)
  );

  // Trim empty top/bottom rows
  let visibleRows = rows;
  if (isTrimmed) {
    const start = rowHasContent.findIndex(Boolean);
    const end =
      rowHasContent.length -
      1 -
      [...rowHasContent].reverse().findIndex(Boolean);
    visibleRows = rows.slice(start, end + 1);
  }

  return (
    <div
      className="w-12 sm:w-14 md:w-16 lg:w-18 h-fit neoprene-mat scroll-texture border border-stone-300 grid grid-cols-5 gap-0.5 p-1 backdrop-blur-sm shadow-inner"
      style={{
        gridTemplateRows: `repeat(${visibleRows.length}, minmax(0, 1fr))`,
      }}
    >
      {visibleRows.map((r) =>
        cols.map((c) => {
          const isCenter = r === 2 && c === 2;
          if (isCenter) {
            return (
              <div
                key={`${r}-${c}`}
                className="aspect-square flex items-center justify-center shadow-sm bg-black"
              />
            );
          }
          const hasMove = movesToShow.some(
            ({ x, y }) => 2 - y === r && 2 + x === c
          );
          return (
            <div
              key={`${r}-${c}`}
              className={`aspect-square transition-colors flex items-center justify-center ${
                hasMove
                  ? "bg-stone-400/80 shadow-sm"
                  : "bg-stone-50 hover:bg-stone-100"
              }`}
            />
          );
        })
      )}
    </div>
  );
}
