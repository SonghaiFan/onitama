"use client";

import { motion } from "framer-motion";
import { Piece } from "@/types/game";

// Draggable piece component
interface DraggablePieceProps {
  piece: Piece;
  row: number;
  col: number;
  isSelected: boolean;
  canDrag: boolean;
  isDraggedPiece: boolean;
  selectedCardIndex?: number;
  onDragStart: (
    e: React.MouseEvent,
    piece: Piece,
    position: [number, number]
  ) => void;
}

// Piece icon component (minimal, similar to TempleArchIcon approach)
function PieceIcon({
  player,
  isMaster,
}: {
  player: "red" | "blue";
  isMaster: boolean;
}) {
  // Use a Unicode chess king for master, pawn for student, rotate for blue
  return (
    <span
      className={`
        absolute inset-0 flex items-center justify-center pointer-events-none z-0
         font-serif  font-bold select-none opacity-60
         ${isMaster ? "text-4xl" : "text-3xl"}
        ${player === "blue" ? "rotate-180 translate-y-0.5" : "-translate-y-1"}
      `}
      aria-hidden="true"
    >
      {isMaster ? "♟" : ""}
    </span>
  );
}

export function DraggablePiece({
  piece,
  row,
  col,
  isSelected,
  canDrag,
  isDraggedPiece,
  selectedCardIndex,
  onDragStart,
}: DraggablePieceProps) {
  const isRed = piece.player === "red";
  const isMaster = piece.isMaster;

  return (
    <motion.div
      className={`
        w-12 h-12 rounded-full border-2 flex items-center justify-center
        ${
          isRed
            ? "bg-red-600 border-red-700 text-white"
            : "bg-blue-600 border-blue-700 text-white"
        }
        ${isMaster ? "master-piece text-amber-100 shadow-lg" : "student-piece"}
        ${canDrag ? "cursor-grab" : "cursor-default"}
        ${isDraggedPiece ? "opacity-50 scale-75" : ""}
        ${isDraggedPiece && selectedCardIndex !== null ? "shadow-xl" : ""}
        font-bold text-xl
      `}
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
      layoutId={piece.id}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
      onMouseDown={(e) => {
        if (canDrag && (e.button === 0 || e.button === 2)) {
          onDragStart(e, piece, [row, col]);
        }
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <PieceIcon player={piece.player} isMaster={isMaster} />
      </div>
    </motion.div>
  );
}

// Drag overlay component
interface DragOverlayProps {
  piece: Piece;
  cardIndex: number;
}

export function DragOverlay({ piece }: DragOverlayProps) {
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
        shadow-xl
      `}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <PieceIcon player={piece.player} isMaster={isMaster} />
      </div>
    </motion.div>
  );
}
