import React from "react";
import { ZenDropdown } from "./ZenDropdown";
import { SelectionGroup } from "./SelectionGroup";
import { ZenButton } from "./ZenButton";
import {
  SelectableItem,
  SelectionGroupConfig,
  SelectionState,
} from "@/types/ui";
import { AIAlgorithm } from "@/utils/ai/aiFactory";
import { CardPack } from "@/types/game";
import { isAICompatible, getAIDisabledReason } from "@/utils/aiRestrictions";

interface AIDropdownProps {
  language: "zh" | "en";
  aiEnabled: boolean;
  onSetAIEnabled: (enabled: boolean) => void;
  aiAlgorithm?: AIAlgorithm;
  onAlgorithmChange?: (algorithm: AIAlgorithm) => void;
  selectedPacks?: Set<CardPack>;
  className?: string;
}

export function AIDropdown({
  language,
  aiEnabled,
  onSetAIEnabled,
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
      algorithm: "AI 算法",
      algorithms: {
        easy: "簡單",
        medium: "中等",
        greedy: "貪心 (快速)",
        minimax: "極小極大 (經典)",
        alphabeta: "α-β剪枝 (優化)",
        montecarlo: "蒙特卡羅 (統計)",
        hybrid: "混合算法 (高級)",
      },
    },
    en: {
      aiSettings: "AI Settings",
      enableAI: "Enable AI",
      disableAI: "Disable AI",
      algorithm: "AI Algorithm",
      algorithms: {
        easy: "Easy",
        medium: "Medium",
        greedy: "Greedy (Fast)",
        minimax: "Minimax (Classic)",
        alphabeta: "Alpha-Beta (Optimized)",
        montecarlo: "Monte Carlo (Statistical)",
        hybrid: "Hybrid (Advanced)",
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

  // Algorithm selection items organized by complexity
  const algorithmItems: SelectableItem<AIAlgorithm>[] = [
    // Beginner algorithms
    { id: "easy", label: t.algorithms.easy },
    { id: "medium", label: t.algorithms.medium },
    // Classic algorithms
    { id: "greedy", label: t.algorithms.greedy },
    { id: "minimax", label: t.algorithms.minimax },
    // Advanced algorithms
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
    columns: 1, // Stack vertically for better readability with longer labels
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

  return (
    <ZenDropdown
      className={className}
      config={{
        positioning: { align: "right", width: 320 },
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

        {aiEnabled && aiCompatible && onAlgorithmChange && (
          <SelectionGroup
            items={algorithmItems}
            config={algorithmConfig}
            selection={algorithmSelection}
          />
        )}
      </div>
    </ZenDropdown>
  );
}