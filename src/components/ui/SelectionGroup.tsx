import React from "react";
import { ZenButton } from "./ZenButton";
import {
  SelectableItem,
  SelectionGroupConfig,
  SelectionState,
} from "@/types/ui";

interface SelectionGroupProps<T = string> {
  items: SelectableItem<T>[];
  config: SelectionGroupConfig<T>;
  selection: SelectionState<T>;
  className?: string;
}

export function SelectionGroup<T extends string = string>({
  items,
  config,
  selection,
  className = "",
}: SelectionGroupProps<T>) {
  const { selected, onChange, onToggle } = selection;
  const { allowMultiple = false, layout = "grid", columns = 2 } = config;

  const handleItemClick = (item: SelectableItem<T>) => {
    if (item.disabled) return;

    const isCurrentlySelected = selected.has(item.id);
    let newSelected = new Set(selected);

    if (allowMultiple) {
      if (isCurrentlySelected) {
        newSelected.delete(item.id);
      } else {
        newSelected.add(item.id);
      }
    } else {
      // Single selection - clear others
      newSelected = isCurrentlySelected ? new Set() : new Set([item.id]);
    }

    onChange(newSelected);
    onToggle?.(item.id, !isCurrentlySelected);
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case "grid":
        return `grid gap-1 sm:gap-2 grid-cols-${columns}`;
      case "list":
        return "flex flex-col gap-1 sm:gap-2";
      case "inline":
        return "flex flex-wrap gap-1 sm:gap-2";
      default:
        return "grid gap-1 sm:gap-2 grid-cols-2";
    }
  };

  return (
    <div className={className}>
      {config.title && (
        <h4 className="text-xs font-medium text-stone-600 mb-1 sm:mb-2 zen-text">
          {config.title}
        </h4>
      )}

      {config.description && (
        <p className="text-xs text-stone-500 mb-2 sm:mb-3 zen-text">
          {config.description}
        </p>
      )}

      <div className={getLayoutClasses()}>
        {items.map((item) => (
          <ZenButton
            key={String(item.id)}
            onClick={() => handleItemClick(item)}
            variant="secondary"
            selected={selected.has(item.id)}
            disabled={item.disabled}
            className="text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 m-0.5 sm:m-1 min-h-[32px] sm:min-h-[40px]"
          >
            <div className="flex items-center gap-1 sm:gap-2 w-full">
              {item.icon && <div className="flex-shrink-0">{item.icon}</div>}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.label}</div>
                {item.description && (
                  <div className="text-xs opacity-75 mt-0.5 truncate">
                    {item.description}
                  </div>
                )}
              </div>
            </div>
          </ZenButton>
        ))}
      </div>

      {config.required && selected.size === 0 && (
        <p className="text-xs text-red-500 mt-1 sm:mt-2">
          At least one selection is required
        </p>
      )}
    </div>
  );
}
