import React from "react";

export interface SelectionOption {
  id: string;
  label: string;
  description?: string;
  selected?: boolean;
  disabled?: boolean;
}

interface SelectionGridProps {
  options: SelectionOption[];
  onToggle: (id: string) => void;
  className?: string;
}

export function SelectionGrid({ options, onToggle, className = "" }: SelectionGridProps) {
  return (
    <div className={`grid gap-4 ${className}`}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onToggle(option.id)}
          disabled={option.disabled}
          className={`zen-card border-2 px-4 py-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 tracking-wide font-light zen-text focus:focus-zen ${
            option.selected
              ? "border-stone-600 text-stone-800 bg-gradient-to-br from-stone-50 to-stone-100 shadow-lg"
              : "border-stone-300 text-stone-600 hover:border-stone-500 hover:bg-stone-50"
          } ${
            option.disabled
              ? "opacity-50 cursor-not-allowed hover:transform-none"
              : ""
          }`}
        >
          <div className="text-center">
            <div className="text-base font-medium mb-1">{option.label}</div>
            {option.description && (
              <div className="text-xs text-stone-500">{option.description}</div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}