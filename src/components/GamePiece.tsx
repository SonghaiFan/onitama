"use client";

import { motion, AnimatePresence } from "framer-motion";
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

// Simple piece configuration - just icons and basic info
const PIECE_ICONS = {
  student: "徒",
  master: "师",
  "wind-spirit": "風",
} as const;

// Helper to get piece type and CSS class
const getPieceType = (piece: Piece) => {
  switch (true) {
    case !!piece.isWindSpirit:
      return "wind-spirit";
    case !!piece.isMaster:
      return "master";
    default:
      return "student";
  }
};

// Get piece CSS class based on type and player
const getPieceClass = (piece: Piece) => {
  const pieceType = getPieceType(piece);
  const playerClass =
    piece.player === "red"
      ? "red"
      : piece.player === "blue"
      ? "blue"
      : "neutral";
  return `${pieceType}-piece ${playerClass}-piece`;
};

// Simple piece icon component - just shows the right icon
function PieceIcon({ piece }: { piece: Piece }) {
  const pieceType = getPieceType(piece);
  const icon = PIECE_ICONS[pieceType];

  return (
    <span
      className="text-lg sm:text-xl md:text-2xl lg:text-3xl opacity-30"
      style={{ fontFamily: "DuanNing" }}
    >
      {icon}
    </span>
  );
}

// Base piece classes
const BASE_PIECE_CLASSES =
  "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full border-2 flex items-center justify-center font-bold text-base sm:text-lg md:text-xl lg:text-2xl";

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
  const pieceClass = getPieceClass(piece);

  const getBoxShadow = () => {
    if (isSelected) return "0 0 20px rgba(251, 191, 36, 0.6)";
    return "0 2px 4px rgba(0, 0, 0, 0.1)";
  };

  return (
    <motion.div
      key={`${piece.id}-${row}-${col}`}
      className={`
        ${BASE_PIECE_CLASSES} relative z-30 select-none
        ${pieceClass}
        ${canDrag ? "cursor-grab" : "cursor-default"}
        ${isDraggedPiece ? "opacity-50 scale-75 dragging" : ""}
        ${isDraggedPiece && selectedCardIndex !== null ? "shadow-xl" : ""}
      `}
      initial={false} // Prevent initial animation on mount
      animate={{
        scale: isSelected ? 1.1 : isDraggedPiece ? 0.75 : 1,
        rotate: 0,
        boxShadow: getBoxShadow(),
        opacity: isDraggedPiece ? 0.5 : 1,
      }}
      whileHover={{
        scale: canDrag ? (isSelected ? 1.15 : 1.05) : 1,
        transition: { type: "spring", stiffness: 400, damping: 10 },
      }}
      whileTap={{ scale: canDrag ? 0.9 : 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        layout: {
          type: "spring",
          stiffness: 400,
          damping: 25,
          duration: 0.5,
        },
      }}
      layout
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
        <PieceIcon piece={piece} />
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
  const pieceClass = getPieceClass(piece);

  return (
    <motion.div
      className={`
        ${BASE_PIECE_CLASSES} relative z-50 shadow-xl select-none
        ${pieceClass}
      `}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <PieceIcon piece={piece} />
      </div>
    </motion.div>
  );
}
