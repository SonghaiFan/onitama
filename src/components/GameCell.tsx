import { useDroppable } from "@dnd-kit/core";
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
  onClick,
  onKeyDown,
}: DroppableCellProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${row}-${col}`,
  });

  const TempleArchIcon = (isRedTempleArch || isBlueTempleArch) && (
    <span
      className={`
          absolute inset-0 flex items-center justify-center pointer-events-none z-0
          font-serif text-5xl select-none opacity-50 text-stone-100
          ${isBlueTempleArch ? "" : "rotate-180"}
        `}
      aria-hidden="true"
    >
      ⛩
    </span>
  );

  return (
    <div
      ref={setNodeRef}
      data-cell-id={`cell-${row}-${col}`}
      className={`
        w-16 h-16 border border-stone-300 flex items-center justify-center cursor-pointer
        transition-all duration-300 hover:shadow-md relative backdrop-blur-sm focus:focus-zen
        ${
          isBlueTempleArch || isRedTempleArch
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
        ${!children && !isPossibleMove ? "hover:bg-stone-100" : ""}
        ${
          isPossibleMove && isDragging
            ? "ring-4 ring-emerald-300 bg-emerald-100"
            : ""
        }
        ${isOver ? "ring-2 ring-blue-400 bg-blue-50 scale-105" : ""}
      `}
    >
      {/* Temple arch text floats underneath content */}
      {TempleArchIcon}
      <div
        onClick={onClick}
        onKeyDown={onKeyDown}
        tabIndex={0}
        className="w-full h-full flex items-center justify-center relative z-10"
      >
        {children}
      </div>
    </div>
  );
}
