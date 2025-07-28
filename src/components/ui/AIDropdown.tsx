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
import { Player } from "@/types/game";

interface AIDropdownProps {
  language: "zh" | "en";
  aiPlayer: Player | null;
  onSetAIPlayer: (player: Player | null) => void;
  aiDifficulty?: AIDifficulty;
  onDifficultyChange?: (difficulty: AIDifficulty) => void;
  className?: string;
}

export function AIDropdown({
  language,
  aiPlayer,
  onSetAIPlayer,
  aiDifficulty,
  onDifficultyChange,
  className = "",
}: AIDropdownProps) {
  // Content translations
  const content = {
    zh: {
      aiSettings: "AI 設置",
      players: "選擇 AI 玩家",
      difficulty: "AI 難度",
      humanVsHuman: "雙人遊戲",
      redAI: "紅方 AI",
      blueAI: "藍方 AI",
      difficulties: {
        easy: "簡單",
        medium: "中等",
        hard: "困難",
        expert: "專家",
      },
    },
    en: {
      aiSettings: "AI Settings",
      players: "Choose AI Players",
      difficulty: "AI Difficulty",
      humanVsHuman: "Human vs Human",
      redAI: "Red AI",
      blueAI: "Blue AI",
      difficulties: {
        easy: "Easy",
        medium: "Medium",
        hard: "Hard",
        expert: "Expert",
      },
    },
  };

  const t = content[language];

  // Player selection items
  const playerItems: SelectableItem<string>[] = [
    {
      id: "none",
      label: t.humanVsHuman,
    },
    {
      id: "red",
      label: t.redAI,
    },
    {
      id: "blue",
      label: t.blueAI,
    },
  ];

  // Difficulty selection items
  const difficultyItems: SelectableItem<AIDifficulty>[] = [
    { id: "easy", label: t.difficulties.easy },
    { id: "medium", label: t.difficulties.medium },
    { id: "hard", label: t.difficulties.hard },
    { id: "expert", label: t.difficulties.expert },
  ];

  // Player selection config
  const playerConfig: SelectionGroupConfig<string> = {
    id: "ai-player",
    title: t.players,
    allowMultiple: false,
    layout: "list",
  };

  // Difficulty selection config
  const difficultyConfig: SelectionGroupConfig<AIDifficulty> = {
    id: "ai-difficulty",
    title: t.difficulty,
    allowMultiple: false,
    layout: "grid",
    columns: 2,
  };

  // Player selection state
  const playerSelection: SelectionState<string> = {
    selected: new Set([aiPlayer || "none"]),
    onChange: (selected) => {
      const selectedPlayer = Array.from(selected)[0];
      onSetAIPlayer(
        selectedPlayer === "none" ? null : (selectedPlayer as Player)
      );
    },
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
          selected={!!aiPlayer}
          className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
        >
          <span className="hidden sm:inline">{t.aiSettings}</span>
          <span className="sm:hidden">AI</span>
          {aiPlayer && (
            <span className="ml-1 text-xs">
              ({aiPlayer === "red" ? "🔴" : "🔵"})
            </span>
          )}
        </ZenButton>
      }
    >
      <div className="space-y-4">
        <SelectionGroup
          items={playerItems}
          config={playerConfig}
          selection={playerSelection}
        />

        {aiPlayer && aiDifficulty && onDifficultyChange && (
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
