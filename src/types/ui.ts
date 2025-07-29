// Core UI Types and Interfaces

export interface SelectableItem<T = string> {
  id: T;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectionGroupConfig<T = string> {
  id: string;
  title?: string;
  description?: string;
  allowMultiple?: boolean;
  required?: boolean;
  minSelections?: number;
  maxSelections?: number;
  layout?: "grid" | "list" | "inline";
  columns?: number;
}

export interface DropdownConfig {
  trigger?: {
    showSelectedCount?: boolean;
    showIcon?: boolean;
    placeholder?: string;
  };
  positioning?: {
    align?: "left" | "right" | "center";
    offset?: number;
    maxHeight?: number;
    width?: number | "trigger" | "content";
  };
  behavior?: {
    closeOnSelect?: boolean;
    searchable?: boolean;
    clearable?: boolean;
  };
  animation?: {
    duration?: number;
    type?: "slide" | "fade" | "scale";
  };
}

export interface ButtonVariant {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  style?: "default" | "zen" | "minimal";
}

export interface SelectionState<T = string> {
  selected: Set<T>;
  onChange: (selected: Set<T>) => void;
  onToggle?: (id: T, isSelected: boolean) => void;
}

export interface ValidationState {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isLoading?: boolean;
}
