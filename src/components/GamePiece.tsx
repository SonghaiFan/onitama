"use client";

import { motion } from "framer-motion";
import { Piece } from "@/types/game";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

// Draggable piece component
interface DraggablePieceProps {
  piece: Piece;
  row: number;
  col: number;
  isSelected: boolean;
  canDrag: boolean;
  isDraggedPiece: boolean;
  selectedCardIndex?: number;
  onRightMouseDown?: (
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
  onRightMouseDown,
}: DraggablePieceProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: piece.id, // Use the unique piece ID
      data: {
        row,
        col,
        piece,
      },
    });

  const isRed = piece.player === "red";
  const isMaster = piece.isMaster;

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
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
        ${
          isDraggedPiece && selectedCardIndex !== null
            ? "ring-2 ring-amber-400"
            : ""
        }
      `}
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
      layoutId={piece.id}
      onContextMenu={(e) => {
        // Prevent context menu on right click
        e.preventDefault();
      }}
      onMouseDown={(e) => {
        // Handle right mouse button
        if (e.button === 2 && onRightMouseDown) {
          onRightMouseDown(e, piece, [row, col]);
        }
      }}
    >
      <div className="relative">{isMaster ? "♔" : "♙"}</div>
    </motion.div>
  );
}

// Droppable cell component
interface DroppableCellProps {
  row: number;
  col: number;
  children: React.ReactNode;
  isPossibleMove: boolean;
  isSelected: boolean;
  isRedTempleArch: boolean;
  isBlueTempleArch: boolean;
  isDragging: boolean;
  dragCardIndex?: number;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export function DroppableCell({
  row,
  col,
  children,
  isPossibleMove,
  isSelected,
  isRedTempleArch,
  isBlueTempleArch,
  isDragging,
  dragCardIndex,
  onClick,
  onKeyDown,
}: DroppableCellProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${row}-${col}`,
  });

  return (
    <div
      ref={setNodeRef}
      data-cell-id={`cell-${row}-${col}`}
      className={`
        w-16 h-16 border border-stone-300 flex items-center justify-center cursor-pointer
        transition-all duration-300 hover:shadow-md relative backdrop-blur-sm focus:focus-zen
        ${isBlueTempleArch ? "temple-arch bg-stone-200 border-stone-400 " : ""}
        ${isRedTempleArch ? "temple-arch bg-stone-200 border-stone-400 " : ""}
        ${
          isSelected
            ? "ring-2 ring-amber-400 bg-amber-100 shadow-lg"
            : isPossibleMove
            ? "ring-2 ring-emerald-400 bg-emerald-50 shadow-md"
            : "bg-stone-50"
        }
        ${!children && !isPossibleMove ? "hover:bg-stone-100" : ""}
        ${
          isPossibleMove && isDragging
            ? "ring-4 ring-emerald-300 bg-emerald-100"
            : ""
        }
        ${isOver ? "ring-2 ring-blue-400 bg-blue-50 scale-105" : ""}
      `}
    >
      <div
        onClick={onClick}
        onKeyDown={onKeyDown}
        tabIndex={0}
        className="w-full h-full flex items-center justify-center"
      >
        {children}
      </div>
    </div>
  );
}

// Drag overlay component
interface DragOverlayProps {
  piece: Piece;
  cardIndex: number;
}

export function DragOverlay({ piece, cardIndex }: DragOverlayProps) {
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
        ring-2 ring-amber-400 shadow-xl
      `}
    >
      <div className="relative">{isMaster ? "♔" : "♙"}</div>
    </motion.div>
  );
}
