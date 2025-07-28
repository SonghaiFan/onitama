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
import { AIAlgorithm, AIFactory } from "@/utils/ai/aiFactory";
import { CardPack } from "@/types/game";
import { isAICompatible, getAIDisabledReason } from "@/utils/aiRestrictions";

interface AIDropdownProps {
  language: "zh" | "en";
  aiEnabled: boolean;
  onSetAIEnabled: (enabled: boolean) => void;
  aiDifficulty?: AIDifficulty;
  onDifficultyChange?: (difficulty: AIDifficulty) => void;
  aiAlgorithm?: AIAlgorithm;
  onAlgorithmChange?: (algorithm: AIAlgorithm) => void;
  selectedPacks?: Set<CardPack>;
  className?: string;
}

export function AIDropdown({
  language,
  aiEnabled,
  onSetAIEnabled,
  aiDifficulty,
  onDifficultyChange,
  aiAlgorithm,
  onAlgorithmChange,
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
      algorithm: "AI 算法",
      difficulties: {
        easy: "簡單",
        medium: "中等",
      },
      algorithms: {
        easy: "簡單",
        medium: "中等",
        greedy: "貪心",
        minimax: "極小極大",
        alphabeta: "α-β剪枝",
        montecarlo: "蒙特卡羅",
        hybrid: "混合算法",
      },
    },
    en: {
      aiSettings: "AI Settings",
      enableAI: "Enable AI",
      disableAI: "Disable AI",
      difficulty: "AI Difficulty",
      algorithm: "AI Algorithm",
      difficulties: {
        easy: "Easy",
        medium: "Medium",
      },
      algorithms: {
        easy: "Easy",
        medium: "Medium",
        greedy: "Greedy",
        minimax: "Minimax",
        alphabeta: "Alpha-Beta",
        montecarlo: "Monte Carlo",
        hybrid: "Hybrid",
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

  // Algorithm selection items
  const algorithmItems: SelectableItem<AIAlgorithm>[] = [
    { id: "easy", label: t.algorithms.easy },
    { id: "medium", label: t.algorithms.medium },
    { id: "greedy", label: t.algorithms.greedy },
    { id: "minimax", label: t.algorithms.minimax },
    { id: "alphabeta", label: t.algorithms.alphabeta },
    { id: "montecarlo", label: t.algorithms.montecarlo },
    { id: "hybrid", label: t.algorithms.hybrid },
  ];

  // Algorithm selection config
  const algorithmConfig: SelectionGroupConfig<AIAlgorithm> = {
    id: "ai-algorithm",
    title: t.algorithm,
    allowMultiple: false,
    layout: "grid",
    columns: 2,
  };

  // Algorithm selection state
  const algorithmSelection: SelectionState<AIAlgorithm> = {
    selected: new Set(aiAlgorithm ? [aiAlgorithm] : []),
    onChange: (selected) => {
      const selectedAlgorithm = Array.from(selected)[0];
      if (selectedAlgorithm && onAlgorithmChange) {
        onAlgorithmChange(selectedAlgorithm);
      }
    },
  };

  // Legacy difficulty selection items (for backward compatibility)
  const difficultyItems: SelectableItem<AIDifficulty>[] = [
    { id: "easy", label: t.difficulties.easy },
    { id: "medium", label: t.difficulties.medium },
  ];

  // Legacy difficulty selection config
  const difficultyConfig: SelectionGroupConfig<AIDifficulty> = {
    id: "ai-difficulty",
    title: t.difficulty,
    allowMultiple: false,
    layout: "grid",
    columns: 2,
  };

  // Legacy difficulty selection state
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

        {aiEnabled && aiCompatible && (
          <>
            {aiAlgorithm && onAlgorithmChange && (
              <SelectionGroup
                items={algorithmItems}
                config={algorithmConfig}
                selection={algorithmSelection}
              />
            )}
            
            {aiDifficulty && onDifficultyChange && !aiAlgorithm && (
              <SelectionGroup
                items={difficultyItems}
                config={difficultyConfig}
                selection={difficultySelection}
              />
            )}
          </>
        )}
      </div>
    </ZenDropdown>
  );
}
