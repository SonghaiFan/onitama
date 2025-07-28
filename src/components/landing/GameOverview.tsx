import React from "react";
import { content, Language } from "./content";
import { IconCircle } from "@/components/ui/IconCircle";

interface GameOverviewProps {
  language: Language;
}

export function GameOverview({ language }: GameOverviewProps) {
  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-stone-800 mb-4 tracking-wide zen-text">
            {content[language].gameOverview}
          </h2>
          <div className="brush-stroke mx-auto"></div>
        </div>
        <div className="space-y-12 sm:space-y-16">
          <div className="text-center">
            <p className="text-lg sm:text-xl text-stone-600 mb-6 sm:mb-8 font-light leading-relaxed max-w-2xl mx-auto zen-text">
              {content[language].subtitle}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 max-w-2xl mx-auto">
              <div className="text-center">
                <IconCircle size="w-12 h-12 sm:w-16 sm:h-16">速</IconCircle>
                <span className="text-sm sm:text-base text-stone-700 font-light zen-text">
                  {content[language].gameFeatures.fast}
                </span>
              </div>
              <div className="text-center">
                <IconCircle size="w-12 h-12 sm:w-16 sm:h-16">智</IconCircle>
                <span className="text-sm sm:text-base text-stone-700 font-light zen-text">
                  {content[language].gameFeatures.wisdom}
                </span>
              </div>
              <div className="text-center">
                <IconCircle size="w-12 h-12 sm:w-16 sm:h-16">勝</IconCircle>
                <span className="text-sm sm:text-base text-stone-700 font-light zen-text">
                  {content[language].gameFeatures.victory}
                </span>
              </div>
            </div>
          </div>
          <div className="zen-card scroll-paper p-6 sm:p-8 lg:p-12 mx-2 sm:mx-4 lg:mx-8">
            <h3 className="text-xl sm:text-2xl font-light text-stone-800 mb-6 sm:mb-8 text-center zen-text">
              {content[language].victoryPaths}
            </h3>
            <div className="space-y-6 sm:space-y-8">
              <div className="text-center">
                <IconCircle
                  size="w-8 h-8 sm:w-12 sm:h-12"
                  className="mb-2 sm:mb-3"
                >
                  石
                </IconCircle>
                <div>
                  <div className="font-medium text-stone-800 mb-1 text-sm sm:text-base">
                    {content[language].victoryPathsDetail.stone.name}
                  </div>
                  <div className="text-stone-600 font-light text-xs sm:text-sm">
                    {content[language].victoryPathsDetail.stone.description}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <IconCircle
                  size="w-8 h-8 sm:w-12 sm:h-12"
                  className="mb-2 sm:mb-3"
                >
                  流
                </IconCircle>
                <div>
                  <div className="font-medium text-stone-800 mb-1 text-sm sm:text-base">
                    {content[language].victoryPathsDetail.stream.name}
                  </div>
                  <div className="text-stone-600 font-light text-xs sm:text-sm">
                    {content[language].victoryPathsDetail.stream.description}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
