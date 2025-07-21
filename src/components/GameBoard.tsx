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
            ? "bg-red-500 border-red-700 text-white"
            : "bg-blue-500 border-blue-700 text-white"
        }
        ${isMaster ? "text-yellow-300 shadow-lg" : ""}
        cursor-pointer hover:scale-110 transition-transform
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
    <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-300 shadow-lg">
      <div className="grid grid-cols-5 gap-1 bg-amber-200 p-2 rounded">
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
                  w-12 h-12 border border-amber-400 flex items-center justify-center cursor-pointer
                  transition-all duration-200 hover:bg-amber-50 relative
                  ${isBlueTempleArch ? "bg-blue-200 border-blue-400" : ""}
                  ${isRedTempleArch ? "bg-red-200 border-red-400" : ""}
                  ${
                    isSelected
                      ? "ring-2 ring-yellow-400 bg-yellow-100"
                      : "bg-amber-50"
                  }
                  ${isPossible ? "ring-2 ring-green-400 bg-green-100" : ""}
                  ${!piece ? "hover:bg-amber-100" : ""}
                `}
              >
                {(isBlueTempleArch || isRedTempleArch) && !piece && (
                  <div
                    className={`text-xs font-bold ${
                      isBlueTempleArch ? "text-blue-600" : "text-red-600"
                    }`}
                  >
                    ⛩
                  </div>
                )}
                {piece && renderPiece(piece)}

                {/* Possible move indicator */}
                {isPossible && !piece && (
                  <div className="w-4 h-4 bg-green-400 rounded-full opacity-70"></div>
                )}
                {isPossible &&
                  piece &&
                  piece.player !== gameState.currentPlayer && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
              </div>
            );
          })
        )}
      </div>

      {/* Board Labels */}
      <div className="flex justify-between items-center mt-4 text-sm font-semibold text-gray-600">
        <span className="text-blue-600">Blue Player</span>
        <span className="text-red-600">Red Player</span>
      </div>
    </div>
  );
}
