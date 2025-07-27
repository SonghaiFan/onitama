"use client";
import { MoveCard, Move } from "@/types/game";
import React from "react";
import { GameSymbol, getPlayerColors } from "@/utils/gameAestheticConfig";

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
    case isMaster && isStudent:
      // When both master and student are true, show the default moves (common moves)
      movesToShow = card.moves;
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

  // Determine the color for move highlighting (using CSS variables)
  const moveColorStyle = isWind
    ? { backgroundColor: getPlayerColors("neutral").cssVar.primary } // Use neutral for wind moves
    : card.color
    ? { backgroundColor: getPlayerColors(card.color).cssVar.primary } // Use card color
    : { backgroundColor: "rgb(0, 0, 0)" }; // Fallback

  // Determine which rows have content (moves or center piece)
  const rowHasContent = rows.map((r) => {
    // Center row always has content (the piece)
    if (r === 2) return true;

    // Check if this row has any moves
    return movesToShow.some((move) => 2 - move.y === r);
  });

  // Trim empty top/bottom rows, but ensure we keep at least the center row
  let visibleRows = rows;
  if (isTrimmed) {
    const start = rowHasContent.findIndex(Boolean);
    const end =
      rowHasContent.length -
      1 -
      [...rowHasContent].reverse().findIndex(Boolean);

    // Safety check: ensure we have valid bounds and include center row
    const safeStart = Math.max(0, Math.min(start, 2)); // Don't start after center
    const safeEnd = Math.min(4, Math.max(end, 2)); // Don't end before center

    visibleRows = rows.slice(safeStart, safeEnd + 1);
  }

  return (
    <div
      className="w-16 sm:w-20 md:w-24 lg:w-28 h-fit neoprene-mat scroll-texture border border-stone-300 grid grid-cols-5 gap-0.5 p-1 backdrop-blur-sm shadow-inner"
      style={{
        gridTemplateRows: `repeat(${visibleRows.length}, minmax(0, 1fr))`,
      }}
    >
      {visibleRows.map((r) =>
        cols.map((c) => {
          const isCenter = r === 2 && c === 2;
          if (isCenter) {
            // Show symbol only for explicit move types, black square for normal moves
            if (isWind || isMaster || isStudent) {
              if (isWind) {
                // For wind cards, show wind spirit symbol
                return (
                  <div
                    key={`${r}-${c}`}
                    className="aspect-square flex items-center justify-center shadow-sm bg-stone-200 overflow-hidden"
                  >
                    <GameSymbol type="wind-spirit" size="sm" />
                  </div>
                );
              } else if (isMaster && isStudent) {
                // For wind card regular moves (both master and student), show split symbol
                return (
                  <div
                    key={`${r}-${c}`}
                    className="aspect-square flex items-center justify-center shadow-sm bg-stone-200 overflow-hidden"
                  >
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="w-1/2 h-full flex items-center justify-center">
                        <GameSymbol type="master" size="xs" />
                      </div>
                      <div className="w-1/2 h-full flex items-center justify-center">
                        <GameSymbol type="student" size="xs" />
                      </div>
                    </div>
                  </div>
                );
              } else if (isMaster) {
                // For master moves, show master symbol
                return (
                  <div
                    key={`${r}-${c}`}
                    className="aspect-square flex items-center justify-center shadow-sm bg-stone-200 overflow-hidden"
                  >
                    <GameSymbol type="master" size="sm" />
                  </div>
                );
              } else if (isStudent) {
                // For student moves, show student symbol
                return (
                  <div
                    key={`${r}-${c}`}
                    className="aspect-square flex items-center justify-center shadow-sm bg-stone-200 overflow-hidden"
                  >
                    <GameSymbol type="student" size="sm" />
                  </div>
                );
              }
            } else {
              // For normal moves (not explicitly typed), use black square
              return (
                <div
                  key={`${r}-${c}`}
                  className="aspect-square flex items-center justify-center shadow-sm bg-black"
                />
              );
            }
          }
          const hasMove = movesToShow.some(
            ({ x, y }) => 2 - y === r && 2 + x === c
          );
          return (
            <div
              key={`${r}-${c}`}
              className={`aspect-square transition-colors flex items-center justify-center ${
                hasMove
                  ? "shadow-sm"
                  : "border border-stone-300/50 bg-stone-100/50"
              }`}
              style={hasMove ? moveColorStyle : undefined}
            />
          );
        })
      )}
    </div>
  );
}
