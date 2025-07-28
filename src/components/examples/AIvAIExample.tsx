"use client";

import React, { useState } from 'react';
import { useGameController } from '@/hooks/useGameController';
import { AIPlayerConfig } from '@/types/game';
import { AISettingsPanel } from '@/components/ui/AISettingsPanel';
import { ZenButton } from '@/components/ui/ZenButton';

/**
 * Example component demonstrating AI vs AI functionality
 * with different tactical presets
 */
export function AIvAIExample() {
  const {
    gameState,
    isAITurn,
    aiPlayers,
    setAIPlayer,
    setAIvsAI,
    setHumanvsHuman,
    resetGame,
  } = useGameController();

  const [showSettings, setShowSettings] = useState(true);

  // Handle AI configuration changes
  const handleRedAIChange = async (config: AIPlayerConfig | null) => {
    await setAIPlayer("red", config);
  };

  const handleBlueAIChange = async (config: AIPlayerConfig | null) => {
    await setAIPlayer("blue", config);
  };

  // Predefined AI vs AI setups
  const setupAgressiveVsDefensive = async () => {
    await setAIvsAI(
      {
        difficulty: "medium",
        tacticalPreset: "aggressive",
        isEnabled: true,
      },
      {
        difficulty: "medium", 
        tacticalPreset: "defensive",
        isEnabled: true,
      }
    );
    setShowSettings(false);
  };

  const setupEasyVsMedium = async () => {
    await setAIvsAI(
      {
        difficulty: "easy",
        tacticalPreset: "default",
        isEnabled: true,
      },
      {
        difficulty: "medium",
        tacticalPreset: "default", 
        isEnabled: true,
      }
    );
    setShowSettings(false);
  };

  const setupCustomBattle = async () => {
    await setAIvsAI(
      {
        difficulty: "medium",
        tacticalPreset: "aggressive",
        isEnabled: true,
      },
      {
        difficulty: "medium",
        tacticalPreset: "custom",
        isEnabled: true,
      }
    );
    setShowSettings(false);
  };

  const startHumanGame = async () => {
    await setHumanvsHuman();
    setShowSettings(false);
  };

  const getCurrentPlayerDisplay = () => {
    const currentAI = aiPlayers[gameState.currentPlayer];
    if (!currentAI?.isEnabled) {
      return gameState.currentPlayer === "red" ? "红方 (人类)" : "蓝方 (人类)";
    }
    
    const difficulty = currentAI.difficulty === "easy" ? "简单" : "中等";
    const preset = {
      default: "默认",
      aggressive: "激进", 
      defensive: "防守",
      custom: "自定义"
    }[currentAI.tacticalPreset];
    
    return `${gameState.currentPlayer === "red" ? "红方" : "蓝方"} AI (${difficulty}/${preset})`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zen-text mb-2">
          🤖 AI vs AI 战术对战系统
        </h1>
        <p className="text-zen-text-secondary">
          AI Tactical Battle System - 观察不同战术预设的 AI 对战
        </p>
      </div>

      {showSettings && (
        <div className="bg-zen-card rounded-lg p-6 border border-zen-border">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-zen-text">
              快速设置 Quick Setup
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ZenButton onClick={setupAgressiveVsDefensive} size="sm">
                激进 vs 防守
              </ZenButton>
              <ZenButton onClick={setupEasyVsMedium} size="sm">
                简单 vs 中等
              </ZenButton>
              <ZenButton onClick={setupCustomBattle} size="sm">
                自定义对战
              </ZenButton>
              <ZenButton onClick={startHumanGame} variant="secondary" size="sm">
                人类游戏
              </ZenButton>
            </div>
          </div>

          <AISettingsPanel
            redAIConfig={aiPlayers.red}
            blueAIConfig={aiPlayers.blue}
            onRedAIChange={handleRedAIChange}
            onBlueAIChange={handleBlueAIChange}
          />

          <div className="mt-6 flex justify-center">
            <ZenButton 
              onClick={() => setShowSettings(false)}
              variant="primary"
            >
              开始游戏 Start Game
            </ZenButton>
          </div>
        </div>
      )}

      {!showSettings && (
        <div className="space-y-4">
          {/* Game Status */}
          <div className="bg-zen-card rounded-lg p-4 border border-zen-border">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-md font-semibold text-zen-text">
                  游戏状态 Game Status
                </h3>
                <p className="text-sm text-zen-text-secondary">
                  当前回合: {getCurrentPlayerDisplay()}
                  {isAITurn && " (思考中...)"}
                </p>
              </div>
              <div className="flex gap-2">
                <ZenButton
                  onClick={() => setShowSettings(true)}
                  variant="secondary"
                  size="sm"
                >
                  设置
                </ZenButton>
                <ZenButton
                  onClick={() => resetGame()}
                  size="sm"
                >
                  重置
                </ZenButton>
              </div>
            </div>
          </div>

          {/* AI Configuration Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiPlayers.red?.isEnabled && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-700 mb-2">红方 AI</h4>
                <div className="text-sm text-red-600">
                  <p>难度: {aiPlayers.red.difficulty === "easy" ? "简单" : "中等"}</p>
                  <p>战术: {
                    {
                      default: "默认策略",
                      aggressive: "激进策略", 
                      defensive: "防守策略",
                      custom: "自定义策略"
                    }[aiPlayers.red.tacticalPreset]
                  }</p>
                </div>
              </div>
            )}

            {aiPlayers.blue?.isEnabled && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-700 mb-2">蓝方 AI</h4>
                <div className="text-sm text-blue-600">
                  <p>难度: {aiPlayers.blue.difficulty === "easy" ? "简单" : "中等"}</p>
                  <p>战术: {
                    {
                      default: "默认策略",
                      aggressive: "激进策略",
                      defensive: "防守策略", 
                      custom: "自定义策略"
                    }[aiPlayers.blue.tacticalPreset]
                  }</p>
                </div>
              </div>
            )}
          </div>

          {/* Game Board Placeholder */}
          <div className="bg-zen-card rounded-lg p-8 border border-zen-border text-center">
            <p className="text-zen-text-secondary mb-4">
              🎯 游戏面板将在这里显示
            </p>
            <p className="text-sm text-zen-text-secondary">
              将此组件集成到您的主游戏界面中以查看 AI 对战
            </p>
          </div>
        </div>
      )}

      {/* Information Panel */}
      <div className="bg-zen-card rounded-lg p-4 border border-zen-border">
        <h3 className="text-md font-semibold mb-2 text-zen-text">
          💡 战术预设说明 Tactical Presets
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-zen-text">激进 Aggressive</h4>
            <p className="text-zen-text-secondary">高攻击性，优先捕获对方棋子，快速推进</p>
          </div>
          <div>
            <h4 className="font-medium text-zen-text">防守 Defensive</h4>
            <p className="text-zen-text-secondary">重视安全性，保护主师，控制中心</p>
          </div>
          <div>
            <h4 className="font-medium text-zen-text">默认 Default</h4>
            <p className="text-zen-text-secondary">平衡策略，攻守兼备</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIvAIExample;