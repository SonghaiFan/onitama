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

  // Render temple arch SVG with rotation and color based on player
  const TempleArchSVG = (isRedTempleArch || isBlueTempleArch) && (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="none"
      className={`absolute inset-0 w-full h-full pointer-events-none opacity-40 z-0 ${
        isBlueTempleArch ? "" : "rotate-180"
      }`}
      aria-hidden="true"
    >
      <text
        x="12"
        y="18"
        textAnchor="middle"
        className="font-serif text-[18px] fill-stone-100 transition-colors duration-200"
      >
        ⛩
      </text>
    </svg>
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
      {/* SVG floats underneath content */}
      {TempleArchSVG}
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
