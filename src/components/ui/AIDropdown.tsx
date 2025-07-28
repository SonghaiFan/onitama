import React, { useState } from "react";
import { ZenDropdown } from "./ZenDropdown";
import { SelectionGroup } from "./SelectionGroup";
import { ZenButton } from "./ZenButton";
import {
  SelectableItem,
  SelectionGroupConfig,
  SelectionState,
} from "@/types/ui";
import { AIDifficulty } from "@/utils/aiService";
import { CardPack, AIPlayerConfig } from "@/types/game";
import { isAICompatible, getAIDisabledReason } from "@/utils/aiRestrictions";
import { AISettingsPanel } from "./AISettingsPanel";

interface AIDropdownProps {
  language: "zh" | "en";
  aiEnabled: boolean;
  onSetAIEnabled: (enabled: boolean) => void;
  aiDifficulty?: AIDifficulty;
  onDifficultyChange?: (difficulty: AIDifficulty) => void;
  selectedPacks?: Set<CardPack>;
  className?: string;
  // New props for AI vs AI support
  redAIConfig?: AIPlayerConfig | null;
  blueAIConfig?: AIPlayerConfig | null;
  onRedAIChange?: (config: AIPlayerConfig | null) => void;
  onBlueAIChange?: (config: AIPlayerConfig | null) => void;
}

export function AIDropdown({
  language,
  aiEnabled,
  onSetAIEnabled,
  aiDifficulty,
  onDifficultyChange,
  selectedPacks = new Set(),
  className = "",
  redAIConfig,
  blueAIConfig,
  onRedAIChange,
  onBlueAIChange,
}: AIDropdownProps) {
  const [useAdvancedMode, setUseAdvancedMode] = useState(false);
  
  // Content translations
  const content = {
    zh: {
      aiSettings: "AI 設置",
      enableAI: "啟用 AI",
      disableAI: "關閉 AI",
      difficulty: "AI 難度",
      advancedMode: "高級模式",
      basicMode: "基礎模式",
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
      advancedMode: "Advanced Mode",
      basicMode: "Basic Mode",
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

  // Check if advanced AI features are available
  const hasAdvancedFeatures = onRedAIChange && onBlueAIChange;
  const hasAnyAI = (redAIConfig?.isEnabled || blueAIConfig?.isEnabled || aiEnabled);

  // Auto-disable AI if not compatible
  React.useEffect(() => {
    if (!aiCompatible && aiEnabled) {
      onSetAIEnabled(false);
    }
  }, [aiCompatible, aiEnabled, onSetAIEnabled]);

  // Legacy mode handlers (for backward compatibility)
  const handleLegacyAIToggle = () => {
    if (!hasAdvancedFeatures) {
      onSetAIEnabled(!aiEnabled);
    } else {
      // In advanced mode, toggle blue AI (human vs AI)
      if (blueAIConfig?.isEnabled) {
        onBlueAIChange?.(null);
      } else {
        onBlueAIChange?.({
          difficulty: aiDifficulty || "medium",
          tacticalPreset: "default",
          isEnabled: true,
        });
      }
    }
  };

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
        positioning: { align: "right", width: hasAdvancedFeatures && useAdvancedMode ? 360 : 280 },
        behavior: { closeOnSelect: false },
        animation: { type: "slide", duration: 200 },
      }}
      trigger={
        <ZenButton
          onClick={() => {}}
          variant="secondary"
          selected={hasAnyAI}
          disabled={!aiCompatible}
          className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
        >
          <span className="hidden sm:inline">{t.aiSettings}</span>
          <span className="sm:hidden">AI</span>
          {hasAnyAI && <span className="ml-1 text-xs">(🤖)</span>}
        </ZenButton>
      }
    >
      <div className="space-y-4">
        {!aiCompatible && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
            {disabledReason}
          </div>
        )}

        {hasAdvancedFeatures && (
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setUseAdvancedMode(false)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  !useAdvancedMode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.basicMode}
              </button>
              <button
                onClick={() => setUseAdvancedMode(true)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  useAdvancedMode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.advancedMode}
              </button>
            </div>
          </div>
        )}

        {!useAdvancedMode || !hasAdvancedFeatures ? (
          // Basic/Legacy Mode
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <ZenButton
                onClick={handleLegacyAIToggle}
                variant={hasAnyAI ? "primary" : "secondary"}
                disabled={!aiCompatible}
                className="w-full justify-start px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
              >
                {hasAnyAI ? t.disableAI : t.enableAI}
              </ZenButton>
            </div>

            {hasAnyAI && aiDifficulty && onDifficultyChange && aiCompatible && (
              <SelectionGroup
                items={difficultyItems}
                config={difficultyConfig}
                selection={difficultySelection}
              />
            )}
          </div>
        ) : (
          // Advanced Mode - Full AI vs AI
          <AISettingsPanel
            redAIConfig={redAIConfig || null}
            blueAIConfig={blueAIConfig || null}
            onRedAIChange={onRedAIChange!}
            onBlueAIChange={onBlueAIChange!}
            className="max-h-96 overflow-y-auto"
          />
        )}
      </div>
    </ZenDropdown>
  );
}
