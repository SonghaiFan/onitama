"use client";

import { motion } from "motion/react";
import { GameState, Position, GamePiece } from "@/types/game";
import { isTempleArch } from "@/utils/gameLogic";

interface GameBoardProps {
  gameState: GameState;
  onPieceClick: (position: Position) => void;
  possibleMoves?: Position[];
}

export default function GameBoard({
  gameState,
  onPieceClick,
  possibleMoves = [],
}: GameBoardProps) {
  const handleCellClick = (row: number, col: number) => {
    onPieceClick({ row, col });
  };

  const renderPiece = (piece: GamePiece | null, row: number, col: number) => {
    if (!piece) return null;

    const isPlayer1 = piece.player === "player1";
    const isMaster = piece.type === "master";
    const isSelected =
      gameState.selectedPiece?.row === row &&
      gameState.selectedPiece?.col === col;

    return (
      <motion.div
        key={`piece-${piece.player}-${piece.type}-${row}-${col}`}
        className={`
          relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl cursor-pointer
          ${
            isMaster
              ? "master-piece"
              : isPlayer1
              ? "student-piece bg-blue-500"
              : "student-piece bg-red-500"
          }
          ${isSelected ? "ring-4 ring-yellow-400 scale-110 z-10" : ""}
          transition-all duration-300 hover:scale-110 font-serif
        `}
        style={{
          fontFamily: '"Noto Serif JP", serif',
          textShadow: "0 1px 2px rgba(0,0,0,0.3)",
        }}
        whileHover={{
          scale: isSelected ? 1.2 : 1.1,
          rotateZ: 5,
          y: -2,
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, rotate: 180 }}
        animate={{
          scale: isSelected ? 1.1 : 1,
          rotate: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          duration: 0.6,
        }}
      >
        {/* Premium piece styling with Japanese aesthetics */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
        <span className="relative z-10 text-white drop-shadow-sm">
          {isMaster ? "将" : "卒"}
        </span>

        {/* Subtle glow for selected pieces */}
        {isSelected && (
          <motion.div
            className="absolute inset-0 rounded-full bg-yellow-400/30 blur-md -z-10"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.div>
    );
  };

  const isPossibleMove = (row: number, col: number): boolean => {
    return possibleMoves.some((move) => move.row === row && move.col === col);
  };

  return (
    <div className="relative">
      {/* Traditional Japanese frame with watercolor wash */}
      <div className="absolute -inset-8 watercolor-wash rounded-3xl opacity-30" />

      {/* Calligraphy-inspired border decoration */}
      <div className="absolute -inset-6 calligraphy-border rounded-2xl opacity-20" />

      {/* Main scroll-like game board */}
      <motion.div
        className="scroll-texture neoprene-mat rounded-2xl p-8 relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, rotateX: -15 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 1, type: "spring", stiffness: 100 }}
        whileHover={{
          scale: 1.02,
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
        }}
      >
        {/* Traditional corner decorations */}
        <div className="absolute top-2 left-2 w-8 h-8 opacity-30">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full text-amber-700"
          >
            <path
              d="M12 2L13.5 8.5L20 7L14.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L9.5 12L4 7L10.5 8.5L12 2Z"
              fill="currentColor"
              opacity="0.6"
            />
          </svg>
        </div>
        <div className="absolute top-2 right-2 w-8 h-8 opacity-30 rotate-90">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full text-amber-700"
          >
            <path
              d="M12 2L13.5 8.5L20 7L14.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L9.5 12L4 7L10.5 8.5L12 2Z"
              fill="currentColor"
              opacity="0.6"
            />
          </svg>
        </div>
        <div className="absolute bottom-2 left-2 w-8 h-8 opacity-30 rotate-180">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full text-amber-700"
          >
            <path
              d="M12 2L13.5 8.5L20 7L14.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L9.5 12L4 7L10.5 8.5L12 2Z"
              fill="currentColor"
              opacity="0.6"
            />
          </svg>
        </div>
        <div className="absolute bottom-2 right-2 w-8 h-8 opacity-30 -rotate-90">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full text-amber-700"
          >
            <path
              d="M12 2L13.5 8.5L20 7L14.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L9.5 12L4 7L10.5 8.5L12 2Z"
              fill="currentColor"
              opacity="0.6"
            />
          </svg>
        </div>

        {/* 5x5 Grid with zen aesthetics */}
        <div className="grid grid-cols-5 gap-3 bg-gradient-to-br from-amber-50/50 to-amber-100/30 p-4 rounded-xl backdrop-blur-sm border border-amber-200/40">
          {Array.from({ length: 5 }, (_, row) =>
            Array.from({ length: 5 }, (_, col) => {
              const piece = gameState.board[row][col];
              const isTemplateArch1 = isTempleArch(row, col, "player1");
              const isTemplateArch2 = isTempleArch(row, col, "player2");
              const isSelected =
                gameState.selectedPiece?.row === row &&
                gameState.selectedPiece?.col === col;
              const isPossible = isPossibleMove(row, col);

              return (
                <motion.div
                  key={`${row}-${col}`}
                  onClick={() => handleCellClick(row, col)}
                  className={`
                    relative w-16 h-16 rounded-lg cursor-pointer transition-all duration-300
                    flex items-center justify-center overflow-hidden
                    ${
                      isTemplateArch1 || isTemplateArch2
                        ? "temple-arch"
                        : "bg-amber-50/80 hover:bg-amber-100/90"
                    }
                    ${
                      isSelected
                        ? "ring-2 ring-yellow-500 bg-yellow-100/50 scale-105"
                        : ""
                    }
                    ${
                      isPossible
                        ? "ring-2 ring-emerald-400 bg-emerald-50/60"
                        : ""
                    }
                    border border-amber-200/60 hover:border-amber-300/80
                  `}
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: isPossible
                      ? "rgb(236, 253, 245)"
                      : "rgb(255, 251, 235)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: (row * 5 + col) * 0.02,
                    type: "spring",
                    stiffness: 300,
                  }}
                >
                  {/* Temple Arch with traditional styling */}
                  {(isTemplateArch1 || isTemplateArch2) && !piece && (
                    <motion.div
                      className={`text-2xl font-bold ${
                        isTemplateArch1 ? "text-blue-600" : "text-red-600"
                      } relative z-10`}
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 2, 0, -2, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
                    >
                      ⛩
                    </motion.div>
                  )}

                  {/* Game piece */}
                  {piece && renderPiece(piece, row, col)}

                  {/* Move indicators with zen styling */}
                  {isPossible && !piece && (
                    <motion.div
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 opacity-80 shadow-lg"
                      initial={{ scale: 0, rotate: 0 }}
                      animate={{
                        scale: [0.8, 1, 0.8],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}

                  {/* Capture indicator */}
                  {isPossible &&
                    piece &&
                    piece.player !== gameState.currentPlayer && (
                      <motion.div
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg z-20"
                        initial={{ scale: 0, rotate: 0 }}
                        animate={{
                          scale: [0.9, 1.1, 0.9],
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}

                  {/* Grid intersection dots for authenticity */}
                  <div className="absolute inset-0 pointer-events-none">
                    {row < 4 && col < 4 && (
                      <div className="absolute bottom-0 right-0 w-1 h-1 bg-amber-300/60 rounded-full transform translate-x-1/2 translate-y-1/2" />
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Elegant player labels with Japanese typography */}
        <motion.div
          className="flex justify-between items-center mt-6 px-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div
            className="text-sm font-medium text-red-700 flex items-center space-x-2"
            style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
          >
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-sm" />
            <span>上位者 (Player 2)</span>
          </div>
          <div
            className="text-xs text-amber-700/70 font-light tracking-wide"
            style={{ fontFamily: '"Noto Serif JP", serif' }}
          >
            鬼魂 • Onitama
          </div>
          <div
            className="text-sm font-medium text-blue-700 flex items-center space-x-2"
            style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
          >
            <span>下位者 (Player 1)</span>
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
