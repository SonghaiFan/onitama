import React from "react";

export function ZenButton({
  onClick,
  children,
  variant = "primary",
  className = "",
  disabled = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  disabled?: boolean;
}) {
  const baseClasses =
    "zen-card border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 tracking-wide font-light zen-text focus:focus-zen";
  const variantClasses =
    variant === "primary"
      ? "border-stone-300 text-stone-800"
      : "border-stone-400 text-stone-700";

  const disabledClasses = disabled
    ? "opacity-40 cursor-not-allowed hover:shadow-none hover:-translate-y-0 pointer-events-none"
    : "";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
}
