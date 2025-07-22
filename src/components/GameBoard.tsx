"use client";

import { motion, AnimatePresence } from "framer-motion";
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
      <motion.div
        className={`
        w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-xl
        ${
          isRed
            ? "bg-red-600 border-red-700 text-white"
            : "bg-blue-600 border-blue-700 text-white"
        }
        ${isMaster ? "master-piece text-amber-100 shadow-lg" : "student-piece"}
        cursor-pointer
      `}
        initial={{ scale: 0, rotate: -180 }}
        animate={{
          scale: 1,
          rotate: 0,
        }}
        whileHover={{
          scale: 1.1,
          transition: { type: "spring", stiffness: 400, damping: 10 },
        }}
        whileTap={{ scale: 0.9 }}
        exit={{
          scale: 0,
          rotate: 180,
          transition: { duration: 0.3 },
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          duration: 0.5,
        }}
        layoutId={`piece-${piece.player}-${
          piece.isMaster
            ? "master"
            : `student-${piece.position[0]}-${piece.position[1]}`
        }`}
      >
        {isMaster ? "♔" : "♙"}
      </motion.div>
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
                  w-16 h-16 border border-stone-300 flex items-center justify-center cursor-pointer
                  transition-all duration-300 hover:shadow-md relative backdrop-blur-sm
                  ${
                    isBlueTempleArch
                      ? "temple-arch bg-stone-200 border-stone-400"
                      : ""
                  }
                  ${
                    isRedTempleArch
                      ? "temple-arch bg-stone-200 border-stone-400"
                      : ""
                  }
                  ${
                    isSelected
                      ? "ring-2 ring-amber-400 bg-amber-100 shadow-lg"
                      : "bg-stone-50"
                  }
                  ${
                    isPossible
                      ? "ring-2 ring-emerald-400 bg-emerald-50 shadow-md"
                      : ""
                  }
                  ${!piece ? "hover:bg-stone-100" : ""}
                `}
              >
                <AnimatePresence>
                  {(isBlueTempleArch || isRedTempleArch) && !piece && (
                    <motion.div
                      className="text-lg text-stone-600"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        y: [0, -2, 0],
                      }}
                      transition={{
                        opacity: { duration: 0.3 },
                        scale: { duration: 0.3 },
                        y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                      }}
                    >
                      ⛩
                    </motion.div>
                  )}

                  {piece && (
                    <AnimatePresence mode="wait">
                      {renderPiece(piece)}
                    </AnimatePresence>
                  )}

                  {/* Possible move indicator */}
                  {isPossible && !piece && (
                    <motion.div
                      className="w-5 h-5 bg-emerald-500 rounded-full shadow-sm"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.6, 1, 0.8],
                      }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                  )}

                  {isPossible &&
                    piece &&
                    piece.player !== gameState.currentPlayer && (
                      <motion.div
                        className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 rounded-full shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.8, 1, 0.8],
                        }}
                        exit={{ scale: 0 }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                      />
                    )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
