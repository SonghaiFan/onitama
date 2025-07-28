import React from "react";

// Reusable components
export function IconCircle({
  children,
  size = "w-16 h-16",
  className = "",
}: {
  children: React.ReactNode;
  size?: string;
  className?: string;
}) {
  return (
    <div
      className={`${size} bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 ${className}`}
    >
      <span
        className="text-4xl text-stone-600"
        style={{ fontFamily: "DuanNing" }}
      >
        {children}
      </span>
    </div>
  );
}

export function SectionTitle({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="flex items-center justify-center mb-12">
      <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center mr-4">
        <span
          className="text-stone-700 font-light"
          style={{ fontFamily: "DuanNing" }}
        >
          {number}
        </span>
      </div>
      <h3 className="text-3xl font-light text-stone-800 tracking-wide zen-text">
        {title}
      </h3>
    </div>
  );
}

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
