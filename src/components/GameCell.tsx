// Cell component for the game board
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
  isTouched?: boolean;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
}

export function DroppableCell({
  row,
  col,
  children,
  isPossibleMove,
  isSelected,
  isRedTempleArch,
  isBlueTempleArch,
  isTouched,
  onClick,
  onKeyDown,
  onTouchStart,
  onTouchEnd,
}: DroppableCellProps) {
  const TempleArchIcon = (isRedTempleArch || isBlueTempleArch) && (
    <span
      className={`absolute inset-0 flex items-center justify-center pointer-events-none z-5 font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl select-none opacity-50 text-stone-100 ${
        isBlueTempleArch ? "" : "rotate-180"
      }`}
      aria-hidden="true"
    >
      ⛩
    </span>
  );

  return (
    <div
      data-cell-id={`cell-${row}-${col}`}
      className={`w-12 sm:w-14 md:w-16 lg:w-18 aspect-square border border-stone-300 flex items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-md relative bg-stone-50 backdrop-blur-sm focus:focus-zen z-10 hover:z-9999 ${
        isTouched ? "z-9999" : ""
      } ${
        isBlueTempleArch || isRedTempleArch
          ? "temple-arch bg-stone-200 border-stone-400"
          : ""
      } ${
        isSelected
          ? "ring-2 ring-amber-400 bg-amber-100"
          : isPossibleMove
          ? "ring-2 ring-emerald-400 bg-emerald-50"
          : ""
      } ${!children && !isPossibleMove ? "hover:bg-stone-100" : ""}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {TempleArchIcon}
      <div
        onClick={onClick}
        onKeyDown={onKeyDown}
        tabIndex={0}
        className="w-full h-full flex items-center justify-center relative z-15"
      >
        {children}
      </div>
    </div>
  );
}
