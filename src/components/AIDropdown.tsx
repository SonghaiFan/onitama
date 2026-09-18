import React from "react";
import { ZenDropdown } from "@/components/ui/ZenDropdown";
import { SelectionGroup } from "@/components/ui/SelectionGroup";
import { ZenButton } from "@/components/ui/ZenButton";
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
  showWinProbability?: boolean;
  onToggleWinProbability?: (show: boolean) => void;
  className?: string;
}

export function AIDropdown({
  language,
  aiEnabled,
  onSetAIEnabled,
  aiAlgorithm,
  onAlgorithmChange,
  selectedPacks = new Set(),
  showWinProbability = true,
  onToggleWinProbability,
  className = "",
}: AIDropdownProps) {
  // Content translations
  const content = {
    zh: {
      aiSettings: "AI 設置",
      enableAI: "啟用 AI",
      disableAI: "關閉 AI",
      algorithm: "AI 算法",
      showWinRate: "顯示勝率",
      hideWinRate: "隱藏勝率",
      algorithms: {
        "master-alphabeta": "宗師",
        "hybrid-montecarlo": "混合蒙特",
        "hard-montecarlo": "強硬蒙特",
        "pure-montecarlo": "純蒙特",
        easy: "簡易",
      },
    },
    en: {
      aiSettings: "AI Settings",
      enableAI: "Enable AI",
      disableAI: "Disable AI",
      algorithm: "AI Algorithm",
      showWinRate: "Show Win Rate",
      hideWinRate: "Hide Win Rate",
      algorithms: {
        "master-alphabeta": "Master",
        "hybrid-montecarlo": "Hybrid",
        "hard-montecarlo": "Hard",
        "pure-montecarlo": "Pure MC",
        easy: "Easy",
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
    { id: "master-alphabeta", label: t.algorithms["master-alphabeta"] },
    { id: "hybrid-montecarlo", label: t.algorithms["hybrid-montecarlo"] },
    { id: "hard-montecarlo", label: t.algorithms["hard-montecarlo"] },
    { id: "pure-montecarlo", label: t.algorithms["pure-montecarlo"] },
    { id: "easy", label: t.algorithms.easy },
  ];

  // Algorithm selection config
  const algorithmConfig: SelectionGroupConfig<AIAlgorithm> = {
    id: "ai-algorithm",
    title: t.algorithm,
    allowMultiple: false,
    layout: "grid",
    columns: 2, // Use 2 columns for better mobile layout
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
        positioning: {
          align: "right",
          width: 250,
          maxHeight: 350,
        },
        behavior: { closeOnSelect: true }, // Close on select for mobile
        animation: { type: "slide", duration: 150 }, // Faster animation for mobile
      }}
      trigger={
        <ZenButton
          onClick={() => {}}
          variant="secondary"
          selected={aiEnabled}
          disabled={!aiCompatible}
          className="px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm"
        >
          <span className="hidden sm:inline">{t.aiSettings}</span>
          <span className="sm:hidden">AI</span>
        </ZenButton>
      }
    >
      <div className="space-y-3 p-2 sm:p-3">
        {!aiCompatible && (
          <div className="mb-3 p-2 zen-text text-xs text-amber-700 bg-amber-50 rounded border border-amber-200">
            {disabledReason}
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <ZenButton
            onClick={() => onSetAIEnabled(!aiEnabled)}
            variant={aiEnabled ? "primary" : "secondary"}
            disabled={!aiCompatible}
            className="w-full justify-center px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm"
          >
            {aiEnabled ? t.disableAI : t.enableAI}
          </ZenButton>
        </div>

        {aiEnabled && aiCompatible && onAlgorithmChange && (
          <SelectionGroup
            items={algorithmItems}
            config={algorithmConfig}
            selection={algorithmSelection}
            className="mt-3"
          />
        )}

        {aiEnabled && onToggleWinProbability && (
          <div className="pt-2 border-t border-stone-200">
            <ZenButton
              onClick={() => onToggleWinProbability(!showWinProbability)}
              variant={showWinProbability ? "primary" : "secondary"}
              className="w-full justify-center px-2 py-1.5 text-xs sm:text-xs"
            >
              {showWinProbability ? t.hideWinRate : t.showWinRate}
            </ZenButton>
          </div>
        )}
      </div>
    </ZenDropdown>
  );
}
