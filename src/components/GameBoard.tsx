"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GameState, Piece } from "@/types/game";
import { isTempleArch, getPossibleMoves } from "@/utils/gameLogic";
import { useState } from "react";

interface GameBoardProps {
  gameState: GameState;
  onPieceClick: (position: [number, number]) => void;
  onPieceMove?: (from: [number, number], to: [number, number]) => void;
}

export default function GameBoard({ gameState, onPieceClick, onPieceMove }: GameBoardProps) {
  const [draggedPiece, setDraggedPiece] = useState<[number, number] | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleCellClick = (row: number, col: number) => {
    onPieceClick([row, col]);
  };

  // Calculate possible moves when both piece and card are selected OR when dragging
  const possibleMoves: [number, number][] = (() => {
    const piecePosition = draggedPiece || gameState.selectedPiece;
    if (!piecePosition || gameState.selectedCard === null) return [];

    const [row, col] = piecePosition;
    const piece = gameState.board[row][col];
    if (!piece) return [];

    const selectedCard =
      gameState.players[gameState.currentPlayer].cards[gameState.selectedCard];
    return getPossibleMoves(piece, selectedCard, gameState.board);
  })();

  const handleDragStart = (row: number, col: number, piece: Piece) => {
    if (piece.player !== gameState.currentPlayer || gameState.winner) return false;
    
    setDraggedPiece([row, col]);
    setIsDragging(true);
    return true;
  };

  const handleDragEnd = (row: number, col: number) => {
    if (draggedPiece && onPieceMove) {
      const isValidDrop = possibleMoves.some(
        ([moveRow, moveCol]) => moveRow === row && moveCol === col
      );
      
      if (isValidDrop) {
        onPieceMove(draggedPiece, [row, col]);
      }
    }
    
    setDraggedPiece(null);
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const renderPiece = (piece: Piece | null, isSelected: boolean = false, row?: number, col?: number) => {
    if (!piece || row === undefined || col === undefined) return null;

    const isRed = piece.player === "red";
    const isMaster = piece.isMaster;
    const canDrag = piece.player === gameState.currentPlayer && !gameState.winner;
    const isDraggedPiece = draggedPiece?.[0] === row && draggedPiece?.[1] === col;

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
        ${canDrag ? "cursor-grab" : "cursor-default"}
        ${isDraggedPiece ? "opacity-50 scale-75" : ""}
      `}
        draggable={canDrag}
        onDragStart={(e) => {
          if (handleDragStart(row, col, piece)) {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", `${row},${col}`);
          } else {
            e.preventDefault();
          }
        }}
        onDragEnd={() => {
          setDraggedPiece(null);
          setIsDragging(false);
        }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{
          scale: isSelected ? 1.1 : isDraggedPiece ? 0.75 : 1,
          rotate: 0,
          boxShadow: isSelected
            ? "0 0 20px rgba(251, 191, 36, 0.6)"
            : "0 2px 4px rgba(0, 0, 0, 0.1)",
          opacity: isDraggedPiece ? 0.5 : 1,
        }}
        whileHover={{
          scale: canDrag ? (isSelected ? 1.15 : 1.05) : 1,
          transition: { type: "spring", stiffness: 400, damping: 10 },
        }}
        whileTap={{ scale: canDrag ? 0.9 : 1 }}
        exit={{
          scale: 0,
          rotate: 180,
          transition: { duration: 0.3 },
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
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

  return (
    <div className="neoprene-mat scroll-texture p-8 border border-stone-300 shadow-2xl">
      <div className="grid grid-cols-5 gap-2 bg-stone-100 p-4 border border-stone-200 shadow-inner ink-wash">
        {Array.from({ length: 5 }, (_, row) =>
          Array.from({ length: 5 }, (_, col) => {
            const piece = gameState.board[row][col];
            const isRedTempleArch = isTempleArch(row, col, "red");
            const isBlueTempleArch = isTempleArch(row, col, "blue");
            const isSelected =
              gameState.selectedPiece?.[0] === row &&
              gameState.selectedPiece?.[1] === col;
            const isPossibleMove = possibleMoves.some(
              ([moveRow, moveCol]) => moveRow === row && moveCol === col
            );

            return (
              <div
                key={`${row}-${col}`}
                onClick={() => handleCellClick(row, col)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleCellClick(row, col)
                }
                onDragOver={handleDragOver}
                onDrop={(e) => {
                  e.preventDefault();
                  const data = e.dataTransfer.getData("text/plain");
                  if (data) {
                    handleDragEnd(row, col);
                  }
                }}
                tabIndex={0}
                className={`
                  w-16 h-16 border border-stone-300 flex items-center justify-center cursor-pointer
                  transition-all duration-300 hover:shadow-md relative backdrop-blur-sm focus:focus-zen
                  ${
                    isBlueTempleArch
                      ? "temple-arch bg-stone-200 border-stone-400 "
                      : ""
                  }
                  ${
                    isRedTempleArch
                      ? "temple-arch bg-stone-200 border-stone-400 "
                      : ""
                  }
                  ${
                    isSelected
                      ? "ring-2 ring-amber-400 bg-amber-100 shadow-lg"
                      : isPossibleMove
                      ? "ring-2 ring-emerald-400 bg-emerald-50 shadow-md"
                      : "bg-stone-50"
                  }
                  ${!piece && !isPossibleMove ? "hover:bg-stone-100" : ""}
                  ${isPossibleMove && isDragging ? "ring-4 ring-emerald-300 bg-emerald-100" : ""}
                `}
              >
                <AnimatePresence mode="wait">
                  {(isBlueTempleArch || isRedTempleArch) && !piece && (
                    <motion.div
                      key={`temple-${row}-${col}-${
                        isBlueTempleArch ? "blue" : "red"
                      }`}
                      className="text-2xl text-stone-600 zen-float"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      transition={{
                        opacity: { duration: 0.3 },
                        scale: { duration: 0.3 },
                      }}
                    >
                      ⛩
                    </motion.div>
                  )}

                  {piece && renderPiece(piece, isSelected, row, col)}

                  {/* Show possible move indicator */}
                  {isPossibleMove && !piece && (
                    <motion.div
                      key={`move-indicator-${row}-${col}`}
                      className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-emerald-600 opacity-80"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
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
