"use client";

import { GameState, Piece, Player } from "@/types/game";
import { isTempleArch } from "@/utils/gameLogic";

interface GameBoardProps {
  gameState: GameState;
  onPieceClick: (position: [number, number]) => void;
  possibleMoves?: [number, number][];
}

export default function GameBoard({
  gameState,
  onPieceClick,
  possibleMoves = [],
}: GameBoardProps) {
  const handleCellClick = (row: number, col: number) => {
    onPieceClick([row, col]);
  };

  const renderPiece = (piece: Piece | null) => {
    if (!piece) return null;

    const isRed = piece.player === "red";
    const isMaster = piece.isMaster;

    return (
      <div
        className={`
        w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm
        ${
          isRed
            ? "bg-red-800 border-red-900 text-red-100"
            : "bg-stone-800 border-stone-900 text-stone-100"
        }
        ${isMaster ? "master-piece text-amber-100 shadow-lg" : "student-piece"}
        cursor-pointer hover:scale-110 transition-all duration-300 zen-float
      `}
      >
        {isMaster ? "♔" : "♙"}
      </div>
    );
  };

  const isPossibleMove = (row: number, col: number): boolean => {
    return possibleMoves.some(
      ([moveRow, moveCol]) => moveRow === row && moveCol === col
    );
  };

  return (
    <div className="neoprene-mat p-8 border border-stone-300 shadow-2xl">
      <div className="grid grid-cols-5 gap-2 bg-stone-100 p-4 border border-stone-200 shadow-inner">
        {Array.from({ length: 5 }, (_, row) =>
          Array.from({ length: 5 }, (_, col) => {
            const piece = gameState.board[row][col];
            const isRedTempleArch = isTempleArch(row, col, "red");
            const isBlueTempleArch = isTempleArch(row, col, "blue");
            const isSelected =
              gameState.selectedPiece?.[0] === row &&
              gameState.selectedPiece?.[1] === col;
            const isPossible = isPossibleMove(row, col);

            return (
              <div
                key={`${row}-${col}`}
                onClick={() => handleCellClick(row, col)}
                className={`
                  w-14 h-14 border border-stone-300 flex items-center justify-center cursor-pointer
                  transition-all duration-300 hover:shadow-md relative backdrop-blur-sm
                  ${isBlueTempleArch ? "temple-arch bg-stone-200 border-stone-400" : ""}
                  ${isRedTempleArch ? "temple-arch bg-stone-200 border-stone-400" : ""}
                  ${
                    isSelected
                      ? "ring-2 ring-amber-400 bg-amber-100 shadow-lg"
                      : "bg-stone-50"
                  }
                  ${isPossible ? "ring-2 ring-emerald-400 bg-emerald-50 shadow-md" : ""}
                  ${!piece ? "hover:bg-stone-100" : ""}
                `}
              >
                {(isBlueTempleArch || isRedTempleArch) && !piece && (
                  <div className="text-lg text-stone-600 zen-float">
                    ⛩
                  </div>
                )}
                {piece && renderPiece(piece)}

                {/* Possible move indicator */}
                {isPossible && !piece && (
                  <div className="w-5 h-5 bg-emerald-500 rounded-full opacity-80 shadow-sm zen-float"></div>
                )}
                {isPossible &&
                  piece &&
                  piece.player !== gameState.currentPlayer && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 rounded-full shadow-lg animate-pulse"></div>
                  )}
              </div>
            );
          })
        )}
      </div>

      {/* Board Labels - Zen Style */}
      <div className="flex justify-between items-center mt-8">
        <div className="text-center">
          <div className="w-6 h-6 bg-stone-800 rounded-full mb-2 mx-auto"></div>
          <span className="text-sm text-stone-700 font-light tracking-wide">石方</span>
        </div>
        <div className="text-center">
          <div className="w-6 h-6 bg-red-800 rounded-full mb-2 mx-auto"></div>
          <span className="text-sm text-stone-700 font-light tracking-wide">紅方</span>
        </div>
      </div>
    </div>
  );
}
