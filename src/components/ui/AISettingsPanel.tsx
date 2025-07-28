"use client";

import React, { useState } from 'react';
import { AIDifficulty, TacticalPreset, AIPlayerConfig } from '@/types/game';
import { ZenButton } from './ZenButton';
import { ZenDropdown } from './ZenDropdown';

interface AISettingsPanelProps {
  redAIConfig: AIPlayerConfig | null;
  blueAIConfig: AIPlayerConfig | null;
  onRedAIChange: (config: AIPlayerConfig | null) => void;
  onBlueAIChange: (config: AIPlayerConfig | null) => void;
  className?: string;
}

type GameMode = 'human-vs-human' | 'human-vs-ai' | 'ai-vs-human' | 'ai-vs-ai';

const tacticalPresets = [
  { value: 'default' as TacticalPreset, label: '默认 Default', description: '平衡策略' },
  { value: 'aggressive' as TacticalPreset, label: '激进 Aggressive', description: '高攻击性' },
  { value: 'defensive' as TacticalPreset, label: '防守 Defensive', description: '重安全性' },
  { value: 'custom' as TacticalPreset, label: '自定义 Custom', description: '自定义配置' },
];

const difficultyLevels = [
  { value: 'easy' as AIDifficulty, label: '简单 Easy', description: '随机策略' },
  { value: 'medium' as AIDifficulty, label: '中等 Medium', description: '战术评估' },
];

export function AISettingsPanel({
  redAIConfig,
  blueAIConfig,
  onRedAIChange,
  onBlueAIChange,
  className = '',
}: AISettingsPanelProps) {
  const [gameMode, setGameMode] = useState<GameMode>(() => {
    if (redAIConfig?.isEnabled && blueAIConfig?.isEnabled) return 'ai-vs-ai';
    if (redAIConfig?.isEnabled) return 'ai-vs-human';
    if (blueAIConfig?.isEnabled) return 'human-vs-ai';
    return 'human-vs-human';
  });

  const handleGameModeChange = (mode: GameMode) => {
    setGameMode(mode);
    
    switch (mode) {
      case 'human-vs-human':
        onRedAIChange(null);
        onBlueAIChange(null);
        break;
      case 'human-vs-ai':
        onRedAIChange(null);
        onBlueAIChange({
          difficulty: 'medium',
          tacticalPreset: 'default',
          isEnabled: true,
        });
        break;
      case 'ai-vs-human':
        onRedAIChange({
          difficulty: 'medium',
          tacticalPreset: 'default',
          isEnabled: true,
        });
        onBlueAIChange(null);
        break;
      case 'ai-vs-ai':
        onRedAIChange({
          difficulty: 'medium',
          tacticalPreset: 'aggressive',
          isEnabled: true,
        });
        onBlueAIChange({
          difficulty: 'medium',
          tacticalPreset: 'defensive',
          isEnabled: true,
        });
        break;
    }
  };

  const handleRedAIConfigChange = (field: keyof AIPlayerConfig, value: AIDifficulty | TacticalPreset) => {
    if (!redAIConfig) return;
    onRedAIChange({
      ...redAIConfig,
      [field]: value,
    });
  };

  const handleBlueAIConfigChange = (field: keyof AIPlayerConfig, value: AIDifficulty | TacticalPreset) => {
    if (!blueAIConfig) return;
    onBlueAIChange({
      ...blueAIConfig,
      [field]: value,
    });
  };

  return (
    <div className={`ai-settings-panel ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-zen-text">
          游戏模式 Game Mode
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <ZenButton
            onClick={() => handleGameModeChange('human-vs-human')}
            variant={gameMode === 'human-vs-human' ? 'primary' : 'secondary'}
            size="sm"
          >
            人 vs 人
          </ZenButton>
          <ZenButton
            onClick={() => handleGameModeChange('human-vs-ai')}
            variant={gameMode === 'human-vs-ai' ? 'primary' : 'secondary'}
            size="sm"
          >
            人 vs AI
          </ZenButton>
          <ZenButton
            onClick={() => handleGameModeChange('ai-vs-human')}
            variant={gameMode === 'ai-vs-human' ? 'primary' : 'secondary'}
            size="sm"
          >
            AI vs 人
          </ZenButton>
          <ZenButton
            onClick={() => handleGameModeChange('ai-vs-ai')}
            variant={gameMode === 'ai-vs-ai' ? 'primary' : 'secondary'}
            size="sm"
          >
            AI vs AI
          </ZenButton>
        </div>
      </div>

      {/* Red Player AI Settings */}
      {redAIConfig?.isEnabled && (
        <div className="mb-6 p-4 border border-red-300 rounded-lg bg-red-50/50">
          <h4 className="text-md font-semibold mb-3 text-red-700">
            红方 AI 设置 Red AI Settings
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-zen-text mb-1">
                难度 Difficulty
              </label>
              <ZenDropdown
                value={redAIConfig.difficulty}
                onChange={(value) => handleRedAIConfigChange('difficulty', value)}
                options={difficultyLevels}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zen-text mb-1">
                战术预设 Tactical Preset
              </label>
              <ZenDropdown
                value={redAIConfig.tacticalPreset}
                onChange={(value) => handleRedAIConfigChange('tacticalPreset', value)}
                options={tacticalPresets}
                className="w-full"
              />
              <p className="text-xs text-zen-text-secondary mt-1">
                {tacticalPresets.find(p => p.value === redAIConfig.tacticalPreset)?.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Blue Player AI Settings */}
      {blueAIConfig?.isEnabled && (
        <div className="mb-6 p-4 border border-blue-300 rounded-lg bg-blue-50/50">
          <h4 className="text-md font-semibold mb-3 text-blue-700">
            蓝方 AI 设置 Blue AI Settings
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-zen-text mb-1">
                难度 Difficulty
              </label>
              <ZenDropdown
                value={blueAIConfig.difficulty}
                onChange={(value) => handleBlueAIConfigChange('difficulty', value)}
                options={difficultyLevels}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zen-text mb-1">
                战术预设 Tactical Preset
              </label>
              <ZenDropdown
                value={blueAIConfig.tacticalPreset}
                onChange={(value) => handleBlueAIConfigChange('tacticalPreset', value)}
                options={tacticalPresets}
                className="w-full"
              />
              <p className="text-xs text-zen-text-secondary mt-1">
                {tacticalPresets.find(p => p.value === blueAIConfig.tacticalPreset)?.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI vs AI Special Info */}
      {gameMode === 'ai-vs-ai' && (
        <div className="p-4 bg-zen-card rounded-lg border border-zen-border">
          <h4 className="text-sm font-semibold mb-2 text-zen-text">
            🤖 AI 对战模式 AI Battle Mode
          </h4>
          <p className="text-xs text-zen-text-secondary">
            AI 将使用不同的战术预设进行对战。您可以观察不同策略的效果。
            <br />
            AIs will battle using different tactical presets. You can observe the effects of different strategies.
          </p>
        </div>
      )}
    </div>
  );
}

export default AISettingsPanel;