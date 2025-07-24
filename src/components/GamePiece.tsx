"use client";

import { motion } from "framer-motion";
import { Piece } from "@/types/game";

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
  // Simple piece styling based on type and player
  let pieceStyle = "";
  let pieceIcon = "";

  // Determine piece type and icon
  if (piece.isWindSpirit) {
    pieceStyle = "wind-spirit-piece";
    pieceIcon = "風";
  } else if (piece.isMaster) {
    pieceStyle = "master-piece";
    pieceIcon = "师";
  } else {
    pieceStyle = "student-piece";
    pieceIcon = "徒";
  }

  // Add player color
  if (piece.player === "red") {
    pieceStyle += " red-piece";
  } else if (piece.player === "blue") {
    pieceStyle += " blue-piece";
  } else {
    pieceStyle += " neutral-piece";
  }

  // Simple shadow logic
  let shadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
  if (isSelected) {
    shadow = "0 0 20px rgba(251, 191, 36, 0.6)";
  }

  return (
    <motion.div
      key={`${piece.id}-${row}-${col}`}
      className={`
        w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 
        rounded-full border-2 flex items-center justify-center 
        font-bold text-base sm:text-lg md:text-xl lg:text-2xl
        relative z-30 select-none
        ${pieceStyle}
        ${canDrag ? "cursor-grab" : "cursor-default"}
        ${isDraggedPiece ? "opacity-50 scale-75 dragging" : ""}
        ${isDraggedPiece && selectedCardIndex !== null ? "shadow-xl" : ""}
      `}
      initial={false}
      animate={{
        scale: isSelected ? 1.1 : isDraggedPiece ? 0.75 : 1,
        rotate: 0,
        boxShadow: shadow,
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
        <span
          className={`text-lg sm:text-xl md:text-2xl lg:text-3xl opacity-30 ${
            piece.player === "blue" ? "rotate-180" : ""
          }`}
          style={{ fontFamily: "DuanNing" }}
        >
          {pieceIcon}
        </span>
      </div>
    </motion.div>
  );
}

interface DragOverlayProps {
  piece: Piece;
  cardIndex: number;
}

export function DragOverlay({ piece }: DragOverlayProps) {
  // Simple piece styling for drag overlay
  let pieceStyle = "";
  let pieceIcon = "";

  if (piece.isWindSpirit) {
    pieceStyle = "wind-spirit-piece";
    pieceIcon = "風";
  } else if (piece.isMaster) {
    pieceStyle = "master-piece";
    pieceIcon = "师";
  } else {
    pieceStyle = "student-piece";
    pieceIcon = "徒";
  }

  if (piece.player === "red") {
    pieceStyle += " red-piece";
  } else if (piece.player === "blue") {
    pieceStyle += " blue-piece";
  } else {
    pieceStyle += " neutral-piece";
  }

  return (
    <motion.div
      className={`
        w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 
        rounded-full border-2 flex items-center justify-center 
        font-bold text-base sm:text-lg md:text-xl lg:text-2xl
        relative z-50 shadow-xl select-none
        ${pieceStyle}
      `}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <span
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl opacity-30"
          style={{ fontFamily: "DuanNing" }}
        >
          {pieceIcon}
        </span>
      </div>
    </motion.div>
  );
}
