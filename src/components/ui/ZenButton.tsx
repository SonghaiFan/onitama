import React from "react";

export function ZenButton({
  onClick,
  children,
  variant = "primary",
  className = "",
  disabled = false,
  selected = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  disabled?: boolean;
  selected?: boolean;
}) {
  const baseClasses =
    "relative zen-card border transition-all duration-300 tracking-wide font-light zen-text focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-opacity-50 overflow-hidden";

  // Enhanced hover and focus styles with single color hue
  const interactionClasses = disabled
    ? ""
    : "hover:shadow-lg hover:-translate-y-1 hover:border-stone-500 hover:bg-stone-50 active:translate-y-0 active:shadow-md";

  // Selected state - no color change, just subtle styling for triangle badge
  const selectedClasses = selected
    ? "shadow-lg transform scale-[1.02]"
    : "";

  // Variant classes - minimalist approach with better contrast
  const variantClasses = variant === "primary"
    ? "border-stone-400 bg-white hover:bg-stone-50"
    : "border-stone-300 bg-stone-50 hover:bg-white";

  const disabledClasses = disabled
    ? "opacity-40 cursor-not-allowed hover:shadow-none hover:-translate-y-0 hover:border-stone-300 hover:bg-transparent pointer-events-none"
    : "";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${selectedClasses} ${interactionClasses} ${disabledClasses} ${className}`}
    >
      {/* Folded corner triangle for selected state */}
      {selected && (
        <div className="absolute top-0 right-0 z-20">
          <div className="w-0 h-0 border-l-[16px] border-l-transparent border-t-[16px] border-t-stone-600"></div>
        </div>
      )}

      {/* Content with relative positioning */}
      <div className="relative z-10">{children}</div>
    </button>
  );
}
