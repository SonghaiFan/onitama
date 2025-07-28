import React from "react";
import { AIDifficulty } from "@/utils/aiService";
import { AIFactory } from "@/utils/ai/aiFactory";

interface AIAlgorithmSelectorProps {
  currentDifficulty: AIDifficulty;
  onDifficultyChange: (difficulty: AIDifficulty) => void;
  language: "zh" | "en";
}

export function AIAlgorithmSelector({
  currentDifficulty,
  onDifficultyChange,
  language,
}: AIAlgorithmSelectorProps) {
  const difficulties: AIDifficulty[] = ["easy", "medium", "mcts", "enhanced"];

  const getAlgorithmDetails = (difficulty: AIDifficulty) => {
    return AIFactory.getAlgorithmDetails(difficulty);
  };

  const getDifficultyDescription = (difficulty: AIDifficulty) => {
    return AIFactory.getDifficultyDescription(difficulty, language);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-stone-700 zen-text">
        {language === "zh" ? "AI 算法選擇" : "AI Algorithm Selection"}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {difficulties.map((difficulty) => {
          const details = getAlgorithmDetails(difficulty);
          const isSelected = currentDifficulty === difficulty;

          return (
            <div
              key={difficulty}
              className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}
              onClick={() => onDifficultyChange(difficulty)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-stone-800">
                  {getDifficultyDescription(difficulty)}
                </h4>
                {isSelected && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>

              <div className="text-sm text-stone-600 space-y-1">
                <p>
                  <span className="font-medium">
                    {language === "zh" ? "算法：" : "Algorithm: "}
                  </span>
                  {details.searchAlgorithm}
                </p>
                <p>
                  <span className="font-medium">
                    {language === "zh" ? "搜索深度：" : "Search Depth: "}
                  </span>
                  {details.searchDepth}
                </p>
                <p>
                  <span className="font-medium">
                    {language === "zh" ? "評估方法：" : "Evaluation: "}
                  </span>
                  {details.evaluationMethod}
                </p>
              </div>

              {difficulty === "mcts" && (
                <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-800">
                  {language === "zh"
                    ? "✨ 靈感來自 jackadamson 的實現"
                    : "✨ Inspired by jackadamson's implementation"}
                </div>
              )}

              {difficulty === "enhanced" && (
                <div className="mt-2 p-2 bg-green-100 rounded text-xs text-green-800">
                  {language === "zh"
                    ? "🚀 結合 MCTS 和 Minimax 的最佳特性"
                    : "🚀 Combines the best of MCTS and Minimax"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-stone-50 rounded-lg">
        <h4 className="font-medium text-stone-700 mb-2">
          {language === "zh" ? "算法特點" : "Algorithm Features"}
        </h4>
        <div className="text-sm text-stone-600">
          {getAlgorithmDetails(currentDifficulty).features.map(
            (feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-stone-400">•</span>
                <span>{feature}</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
