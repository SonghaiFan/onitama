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
  isWindSpirit,
}: {
  player: "red" | "blue" | "neutral";
  isMaster: boolean;
  isWindSpirit?: boolean;
}) {
  if (isWindSpirit) {
    return (
      <span
        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
        style={{ fontFamily: "DuanNing" }}
      >
        風
      </span>
    );
  }

  if (isMaster) {
    return (
      <span
        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl"
        style={{ fontFamily: "DuanNing" }}
      >
        ♔
      </span>
    );
  }

  return (
    <span
      className="text-lg sm:text-xl md:text-2xl lg:text-3xl"
      style={{ fontFamily: "DuanNing" }}
    >
      ♙
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
  const isWindSpirit = piece.isWindSpirit;

  // Determine piece styling based on type
  const getPieceStyling = () => {
    if (isWindSpirit) {
      return "bg-gradient-to-br from-cyan-400 to-blue-500 border-cyan-600 text-white shadow-lg";
    }
    if (isRed) {
      return "bg-red-600 border-red-700 text-white";
    }
    return "bg-blue-600 border-blue-700 text-white";
  };

  return (
    <motion.div
      className={`
        w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full border-2 flex items-center justify-center relative z-30
        ${getPieceStyling()}
        ${isMaster ? "master-piece text-amber-100 shadow-lg" : "student-piece"}
        ${isWindSpirit ? "wind-spirit-piece shadow-xl" : ""}
        ${canDrag ? "cursor-grab" : "cursor-default"}
        ${isDraggedPiece ? "opacity-50 scale-75 dragging" : ""}
        ${isDraggedPiece && selectedCardIndex !== null ? "shadow-xl" : ""}
        font-bold text-base sm:text-lg md:text-xl lg:text-2xl
      `}
      animate={{
        scale: isSelected ? 1.1 : isDraggedPiece ? 0.75 : 1,
        rotate: 0,
        boxShadow: isSelected
          ? "0 0 20px rgba(251, 191, 36, 0.6)"
          : isWindSpirit
          ? "0 0 15px rgba(34, 211, 238, 0.4)"
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
        <PieceIcon
          player={piece.player}
          isMaster={isMaster}
          isWindSpirit={isWindSpirit}
        />
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
  const isWindSpirit = piece.isWindSpirit;

  // Determine piece styling based on type
  const getPieceStyling = () => {
    if (isWindSpirit) {
      return "bg-gradient-to-br from-cyan-400 to-blue-500 border-cyan-600 text-white shadow-lg";
    }
    if (isRed) {
      return "bg-red-600 border-red-700 text-white";
    }
    return "bg-blue-600 border-blue-700 text-white";
  };

  return (
    <motion.div
      className={`
        w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full border-2 flex items-center justify-center font-bold text-base sm:text-lg md:text-xl lg:text-2xl relative z-50
        ${getPieceStyling()}
        ${isMaster ? "master-piece text-amber-100 shadow-lg" : "student-piece"}
        ${isWindSpirit ? "wind-spirit-piece shadow-xl" : ""}
        shadow-xl
      `}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <PieceIcon
          player={piece.player}
          isMaster={isMaster}
          isWindSpirit={isWindSpirit}
        />
      </div>
    </motion.div>
  );
}
