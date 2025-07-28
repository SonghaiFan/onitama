import React from "react";
import { ZenButton } from "./ZenButton";

export interface SelectionOption<T extends string = string> {
  id: T;
  name: string;
  description: string;
  selectedText: string;
  unselectedText: string;
  available?: boolean;
}

interface SelectionGridProps<T extends string = string> {
  title: string;
  options: SelectionOption<T>[];
  selectedItems: Set<T>;
  onToggleItem: (item: T) => void;
  onConfirm?: () => void;
  confirmText?: string;
  disabled?: boolean;
  showDivider?: boolean;
  dividerAfterIndex?: number;
  className?: string;
  containerClassName?: string;
  // Simple status display props
  statusMessage?: string;
  statusWarning?: string;
  isLoading?: boolean;
  canConfirm?: boolean;
}

function SelectionButton<T extends string = string>({
  option,
  isSelected,
  onClick,
  disabled = false,
}: {
  option: SelectionOption<T>;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || !option.available}
      className={`relative zen-card border-2 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 sm:hover:-translate-y-2 tracking-wide font-light zen-text focus:focus-zen overflow-hidden ${
        isSelected
          ? "border-stone-600 text-stone-800 bg-gradient-to-br from-stone-50 to-stone-100 shadow-lg scale-105"
          : "border-stone-300 text-stone-600 hover:border-stone-500 hover:bg-stone-50"
      } ${
        !option.available || disabled
          ? "opacity-50 cursor-not-allowed hover:shadow-none hover:-translate-y-0"
          : ""
      }`}
    >
      {isSelected && (
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[16px] sm:border-l-[20px] border-l-transparent border-t-[16px] sm:border-t-[20px] border-t-stone-600"></div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full transition-transform duration-700 group-hover:translate-x-full"></div>
      <div className="text-center relative z-10">
        <div className="text-base sm:text-lg font-medium mb-1 sm:mb-2">
          {option.name}
        </div>
        <div className="text-xs sm:text-sm text-stone-500 mb-2 sm:mb-3">
          {option.description}
        </div>
        <div className="text-xs text-stone-400">
          {isSelected ? option.selectedText : option.unselectedText}
        </div>
      </div>
    </button>
  );
}

export function SelectionGrid<T extends string = string>({
  title,
  options,
  selectedItems,
  onToggleItem,
  onConfirm,
  confirmText = "Confirm",
  disabled = false,
  showDivider = false,
  dividerAfterIndex,
  className = "",
  containerClassName = "",
  statusMessage,
  statusWarning,
  isLoading = false,
  canConfirm = true,
}: SelectionGridProps<T>) {
  const availableOptions = options.filter(
    (option) => option.available !== false
  );
  const firstGroup =
    dividerAfterIndex !== undefined
      ? availableOptions.slice(0, dividerAfterIndex)
      : availableOptions;
  const secondGroup =
    dividerAfterIndex !== undefined
      ? availableOptions.slice(dividerAfterIndex)
      : [];

  return (
    <div className={`text-center mb-8 sm:mb-12 ${containerClassName}`}>
      <div className={`container mx-auto px-4 max-w-4xl ${className}`}>
        <h3 className="text-base sm:text-lg text-stone-700 mb-4 sm:mb-6 font-light tracking-wide zen-text">
          {title}
        </h3>

        {/* Status indicator */}
        {(statusMessage || statusWarning || isLoading) && (
          <div className="mb-4 sm:mb-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-stone-50 border border-stone-200 shadow-sm">
              <span className="text-sm text-stone-600 font-light zen-text">
                {isLoading ? "Loading..." : statusMessage}
              </span>
              {statusWarning && !isLoading && (
                <span className="text-red-600 text-sm font-medium zen-text">
                  {statusWarning}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8">
          {firstGroup.map((option) => (
            <SelectionButton
              key={option.id}
              option={option}
              isSelected={selectedItems.has(option.id)}
              onClick={() => onToggleItem(option.id)}
              disabled={disabled}
            />
          ))}

          {showDivider && secondGroup.length > 0 && (
            <div className="w-full h-1 bg-stone-200 my-4 brush-stroke"></div>
          )}

          {secondGroup.map((option) => (
            <SelectionButton
              key={option.id}
              option={option}
              isSelected={selectedItems.has(option.id)}
              onClick={() => onToggleItem(option.id)}
              disabled={disabled}
            />
          ))}
        </div>

        {onConfirm && (
          <ZenButton
            onClick={onConfirm}
            disabled={disabled || !canConfirm || isLoading}
            className="text-base sm:text-lg py-4 sm:py-6 px-8 sm:px-12 mt-8 sm:mt-12"
          >
            {isLoading ? "Loading..." : confirmText}
          </ZenButton>
        )}
      </div>
    </div>
  );
}
