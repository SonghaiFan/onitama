import React from "react";
import { SelectionGroup } from "./SelectionGroup";
import { ZenButton } from "./ZenButton";
import { SelectableItem, SelectionGroupConfig, SelectionState, ValidationState } from "@/types/ui";

interface CardSection<T = string> {
  id: string;
  title?: string;
  description?: string;
  items: SelectableItem<T>[];
  config: SelectionGroupConfig<T>;
  selection: SelectionState<T>;
  validation?: ValidationState;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
  }[];
}

interface MultiSectionCardProps {
  title?: string;
  description?: string;
  sections: CardSection[];
  className?: string;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
  }[];
  validation?: ValidationState;
}

export function MultiSectionCard({
  title,
  description,
  sections,
  className = "",
  actions = [],
  validation,
}: MultiSectionCardProps) {
  return (
    <div className={`zen-card border border-stone-200 p-6 ${className}`}>
      {/* Card Header */}
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-medium text-stone-800 mb-2 zen-text">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-stone-600 zen-text">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={section.id}>
            {/* Section Divider */}
            {index > 0 && (
              <div className="border-t border-stone-200 pt-6" />
            )}

            {/* Section Content */}
            <SelectionGroup
              items={section.items}
              config={section.config}
              selection={section.selection}
            />

            {/* Section Validation */}
            {section.validation && (
              <div className="mt-3">
                {section.validation.errors.map((error, idx) => (
                  <p key={idx} className="text-xs text-red-500 mb-1">
                    {error}
                  </p>
                ))}
                {section.validation.warnings.map((warning, idx) => (
                  <p key={idx} className="text-xs text-amber-500 mb-1">
                    {warning}
                  </p>
                ))}
              </div>
            )}

            {/* Section Actions */}
            {section.actions && section.actions.length > 0 && (
              <div className="flex gap-2 mt-4">
                {section.actions.map((action, idx) => (
                  <ZenButton
                    key={idx}
                    onClick={action.onClick}
                    variant={action.variant || 'secondary'}
                    disabled={action.disabled}
                    className="px-4 py-2 text-sm"
                  >
                    {action.label}
                  </ZenButton>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Card Validation */}
      {validation && (
        <div className="mt-6 pt-4 border-t border-stone-200">
          {validation.errors.map((error, idx) => (
            <p key={idx} className="text-sm text-red-500 mb-2">
              {error}
            </p>
          ))}
          {validation.warnings.map((warning, idx) => (
            <p key={idx} className="text-sm text-amber-500 mb-2">
              {warning}
            </p>
          ))}
          {validation.isLoading && (
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-600" />
              <span>Validating...</span>
            </div>
          )}
        </div>
      )}

      {/* Card Actions */}
      {actions.length > 0 && (
        <div className="flex gap-3 mt-6 pt-4 border-t border-stone-200">
          {actions.map((action, idx) => (
            <ZenButton
              key={idx}
              onClick={action.onClick}
              variant={action.variant || 'primary'}
              disabled={action.disabled}
              className="px-6 py-3"
            >
              {action.label}
            </ZenButton>
          ))}
        </div>
      )}
    </div>
  );
}