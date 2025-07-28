import React from "react";
import { ZenDropdown } from "./ZenDropdown";
import { SelectionGroup } from "./SelectionGroup";
import { ZenButton } from "./ZenButton";
import {
  SelectableItem,
  SelectionGroupConfig,
  SelectionState,
} from "@/types/ui";
import { AIDifficulty } from "@/utils/aiService";
import { CardPack } from "@/types/game";
import { isAICompatible, getAIDisabledReason } from "@/utils/aiRestrictions";

interface AIDropdownProps {
  language: "zh" | "en";
  aiEnabled: boolean;
  onSetAIEnabled: (enabled: boolean) => void;
  aiDifficulty?: AIDifficulty;
  onDifficultyChange?: (difficulty: AIDifficulty) => void;
  selectedPacks?: Set<CardPack>;
  className?: string;
}

export function AIDropdown({
  language,
  aiEnabled,
  onSetAIEnabled,
  aiDifficulty,
  onDifficultyChange,
  selectedPacks = new Set(),
  className = "",
}: AIDropdownProps) {
  // Content translations
  const content = {
    zh: {
      aiSettings: "AI 設置",
      enableAI: "啟用 AI",
      disableAI: "關閉 AI",
      difficulty: "AI 難度",
      difficulties: {
        easy: "簡單",
        medium: "中等",
      },
    },
    en: {
      aiSettings: "AI Settings",
      enableAI: "Enable AI",
      disableAI: "Disable AI",
      difficulty: "AI Difficulty",
      difficulties: {
        easy: "Easy",
        medium: "Medium",
      },
    },
  };

  const t = content[language];

  // Check AI compatibility
  const aiCompatible = isAICompatible(selectedPacks);
  const disabledReason = !aiCompatible
    ? getAIDisabledReason(selectedPacks, language)
    : "";

  // Auto-disable AI if not compatible
  React.useEffect(() => {
    if (!aiCompatible && aiEnabled) {
      onSetAIEnabled(false);
    }
  }, [aiCompatible, aiEnabled, onSetAIEnabled]);

  // Difficulty selection items
  const difficultyItems: SelectableItem<AIDifficulty>[] = [
    { id: "easy", label: t.difficulties.easy },
    { id: "medium", label: t.difficulties.medium },
  ];

  // Difficulty selection config
  const difficultyConfig: SelectionGroupConfig<AIDifficulty> = {
    id: "ai-difficulty",
    title: t.difficulty,
    allowMultiple: false,
    layout: "grid",
    columns: 2,
  };

  // Difficulty selection state
  const difficultySelection: SelectionState<AIDifficulty> = {
    selected: new Set(aiDifficulty ? [aiDifficulty] : []),
    onChange: (selected) => {
      const selectedDifficulty = Array.from(selected)[0];
      if (selectedDifficulty && onDifficultyChange) {
        onDifficultyChange(selectedDifficulty);
      }
    },
  };

  return (
    <ZenDropdown
      className={className}
      config={{
        positioning: { align: "right", width: 280 },
        behavior: { closeOnSelect: false },
        animation: { type: "slide", duration: 200 },
      }}
      trigger={
        <ZenButton
          onClick={() => {}}
          variant="secondary"
          selected={aiEnabled}
          disabled={!aiCompatible}
          className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
        >
          <span className="hidden sm:inline">{t.aiSettings}</span>
          <span className="sm:hidden">AI</span>
          {aiEnabled && <span className="ml-1 text-xs">(🔵)</span>}
        </ZenButton>
      }
    >
      <div className="space-y-4">
        {!aiCompatible && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
            {disabledReason}
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <ZenButton
            onClick={() => onSetAIEnabled(!aiEnabled)}
            variant={aiEnabled ? "primary" : "secondary"}
            disabled={!aiCompatible}
            className="w-full justify-start px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
          >
            {aiEnabled ? t.disableAI : t.enableAI}
          </ZenButton>
        </div>

        {aiEnabled && aiDifficulty && onDifficultyChange && aiCompatible && (
          <SelectionGroup
            items={difficultyItems}
            config={difficultyConfig}
            selection={difficultySelection}
          />
        )}
      </div>
    </ZenDropdown>
  );
}
