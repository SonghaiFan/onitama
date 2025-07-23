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

const PIECE_COLORS = {
  red: "bg-red-600 border-red-700 text-white",
  blue: "bg-blue-600 border-blue-700 text-white",
  neutral: "bg-neutral-400 border-neutral-500 text-white", // For wind spirits
} as const;

// Helper to get piece type
const getPieceType = (piece: Piece) => {
  if (piece.isWindSpirit) return "wind-spirit";
  if (piece.isMaster) return "master";
  return "student";
};

// Simple piece styling - just color based on player/type
const getPieceColor = (piece: Piece) => {
  if (piece.isWindSpirit) return PIECE_COLORS.neutral;
  return PIECE_COLORS[piece.player as keyof typeof PIECE_COLORS];
};

// Simple piece icon component - just shows the right icon
function PieceIcon({ piece }: { piece: Piece }) {
  const pieceType = getPieceType(piece);
  const icon = PIECE_ICONS[pieceType];

  return (
    <span
      className="text-lg sm:text-xl md:text-2xl lg:text-3xl"
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
  const pieceColor = getPieceColor(piece);

  const getBoxShadow = () => {
    if (isSelected) return "0 0 20px rgba(251, 191, 36, 0.6)";
    return "0 2px 4px rgba(0, 0, 0, 0.1)";
  };

  return (
    <motion.div
      key={`${piece.id}-${row}-${col}`}
      className={`
        ${BASE_PIECE_CLASSES} relative z-30
        ${pieceColor}
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
  const pieceColor = getPieceColor(piece);

  return (
    <motion.div
      className={`
        ${BASE_PIECE_CLASSES} relative z-50 shadow-xl
        ${pieceColor}
      `}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <PieceIcon piece={piece} />
      </div>
    </motion.div>
  );
}
