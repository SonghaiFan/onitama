import React from "react";
import { content, Language } from "./content";
import { IconCircle, SectionTitle } from "./shared";

interface HowToPlayProps {
  language: Language;
}

export function HowToPlay({ language }: HowToPlayProps) {
  return (
    <section className="py-16 sm:py-24 lg:py-32 scroll-paper">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-16 sm:mb-20 lg:mb-24">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-stone-800 mb-4 tracking-wide zen-text">
            {content[language].howToPlay}
          </h2>
          <div className="brush-stroke mx-auto"></div>
        </div>

        {/* Setup */}
        <div className="mb-16 sm:mb-20 lg:mb-24">
          <SectionTitle
            number="一"
            title={content[language].setup}
          />
          <div className="grid grid-cols-1 mx-10 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="zen-card p-6 sm:p-8 text-center">
              <IconCircle size="w-12 h-12 sm:w-16 sm:h-16">棋</IconCircle>
              <h4 className="font-medium text-stone-800 mb-3 sm:mb-4 zen-text text-sm sm:text-base">
                {content[language].setupDetails.board.title}
              </h4>
              <p className="text-stone-600 font-light leading-relaxed zen-text text-xs sm:text-sm">
                {content[language].setupDetails.board.description}
              </p>
            </div>
            <div className="zen-card p-6 sm:p-8 text-center">
              <IconCircle size="w-12 h-12 sm:w-16 sm:h-16">牌</IconCircle>
              <h4 className="font-medium text-stone-800 mb-3 sm:mb-4 text-sm sm:text-base">
                {content[language].setupDetails.cards.title}
              </h4>
              <p className="text-stone-600 font-light leading-relaxed text-xs sm:text-sm">
                {content[language].setupDetails.cards.description}
              </p>
            </div>
            <div className="zen-card p-6 sm:p-8 text-center">
              <IconCircle size="w-12 h-12 sm:w-16 sm:h-16">先</IconCircle>
              <h4 className="font-medium text-stone-800 mb-3 sm:mb-4 text-sm sm:text-base">
                {content[language].setupDetails.first.title}
              </h4>
              <p className="text-stone-600 font-light leading-relaxed text-xs sm:text-sm">
                {content[language].setupDetails.first.description}
              </p>
            </div>
          </div>

          {/* Additional setup cards for special packs */}
          <div className="grid grid-cols-1 mx-10 md:grid-cols-2 gap-8 sm:gap-12 mt-8 sm:mt-12">
            <div className="zen-card p-6 sm:p-8 text-center">
              <IconCircle size="w-12 h-12 sm:w-16 sm:h-16">風</IconCircle>
              <h4 className="font-medium text-stone-800 mb-3 sm:mb-4 text-sm sm:text-base">
                {content[language].setupDetails.windSpirit.title}
              </h4>
              <p className="text-stone-600 font-light leading-relaxed text-xs sm:text-sm">
                {content[language].setupDetails.windSpirit.description}
              </p>
            </div>
            <div className="zen-card p-6 sm:p-8 text-center">
              <IconCircle size="w-12 h-12 sm:w-16 sm:h-16">摹</IconCircle>
              <h4 className="font-medium text-stone-800 mb-3 sm:mb-4 text-sm sm:text-base">
                {content[language].setupDetails.dualCards.title}
              </h4>
              <p className="text-stone-600 font-light leading-relaxed text-xs sm:text-sm">
                {content[language].setupDetails.dualCards.description}
              </p>
            </div>
          </div>
        </div>

        {/* Gameplay */}
        <div className="mb-16 sm:mb-20 lg:mb-24">
          <SectionTitle
            number="二"
            title={content[language].gameplay}
          />
          <div className="grid grid-cols-1 mx-10 lg:grid-cols-2 gap-8 sm:gap-12">
            <div className="zen-card p-6 sm:p-8 lg:p-10">
              <div className="flex items-center mb-4 sm:mb-6">
                <IconCircle
                  size="w-8 h-8 sm:w-12 sm:h-12"
                  className="mr-3 sm:mr-4 mb-0"
                >
                  行
                </IconCircle>
                <h4 className="font-medium text-stone-800 text-lg sm:text-xl">
                  {content[language].gameplayDetails.move.title}
                </h4>
              </div>
              <ul className="space-y-2 sm:space-y-3 text-stone-600 font-light text-xs sm:text-sm">
                {content[language].gameplayDetails.move.steps.map(
                  (step, index) => (
                    <li key={index}>• {step}</li>
                  )
                )}
              </ul>
            </div>
            <div className="zen-card p-6 sm:p-8 lg:p-10">
              <div className="flex items-center mb-4 sm:mb-6">
                <IconCircle
                  size="w-8 h-8 sm:w-12 sm:h-12"
                  className="mr-3 sm:mr-4 mb-0"
                >
                  换
                </IconCircle>
                <h4 className="font-medium text-stone-800 text-lg sm:text-xl">
                  {content[language].gameplayDetails.exchange.title}
                </h4>
              </div>
              <ul className="space-y-2 sm:space-y-3 text-stone-600 font-light text-xs sm:text-sm">
                {content[language].gameplayDetails.exchange.steps.map(
                  (step, index) => (
                    <li key={index}>• {step}</li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* Additional gameplay sections for special packs */}
          <div className="grid grid-cols-1 mx-10 lg:grid-cols-2 gap-8 sm:gap-12 mt-8 sm:mt-12">
            <div className="zen-card p-6 sm:p-8 lg:p-10">
              <div className="flex items-center mb-4 sm:mb-6">
                <IconCircle
                  size="w-8 h-8 sm:w-12 sm:h-12"
                  className="mr-3 sm:mr-4 mb-0"
                >
                  風
                </IconCircle>
                <h4 className="font-medium text-stone-800 text-lg sm:text-xl">
                  {content[language].gameplayDetails.windSpirit.title}
                </h4>
              </div>
              <ul className="space-y-2 sm:space-y-3 text-stone-600 font-light text-xs sm:text-sm">
                {content[language].gameplayDetails.windSpirit.steps.map(
                  (step, index) => (
                    <li key={index}>• {step}</li>
                  )
                )}
              </ul>
            </div>
            <div className="zen-card p-6 sm:p-8 lg:p-10">
              <div className="flex items-center mb-4 sm:mb-6">
                <IconCircle
                  size="w-8 h-8 sm:w-12 sm:h-12"
                  className="mr-3 sm:mr-4 mb-0"
                >
                  摹
                </IconCircle>
                <h4 className="font-medium text-stone-800 text-lg sm:text-xl">
                  {content[language].gameplayDetails.dualCards.title}
                </h4>
              </div>
              <ul className="space-y-2 sm:space-y-3 text-stone-600 font-light text-xs sm:text-sm">
                {content[language].gameplayDetails.dualCards.steps.map(
                  (step, index) => (
                    <li key={index}>• {step}</li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Strategy Tips */}
        <div className="mb-16 sm:mb-20 lg:mb-24">
          <SectionTitle
            number="三"
            title={content[language].strategy}
          />
          <div className="grid grid-cols-1 mx-10 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="zen-card p-6 sm:p-8 text-center">
              <IconCircle size="w-12 h-12 sm:w-16 sm:h-16">思</IconCircle>
              <h4 className="font-medium text-stone-800 mb-3 sm:mb-4 text-sm sm:text-base">
                {content[language].strategyTips.think.title}
              </h4>
              <p className="text-stone-600 font-light leading-relaxed text-xs sm:text-sm">
                {content[language].strategyTips.think.description}
              </p>
            </div>
            <div className="zen-card p-6 sm:p-8 text-center">
              <IconCircle size="w-12 h-12 sm:w-16 sm:h-16">中</IconCircle>
              <h4 className="font-medium text-stone-800 mb-3 sm:mb-4 text-sm sm:text-base">
                {content[language].strategyTips.center.title}
              </h4>
              <p className="text-stone-600 font-light leading-relaxed text-xs sm:text-sm">
                {content[language].strategyTips.center.description}
              </p>
            </div>
            <div className="zen-card p-6 sm:p-8 text-center">
              <IconCircle size="w-12 h-12 sm:w-16 sm:h-16">平</IconCircle>
              <h4 className="font-medium text-stone-800 mb-3 sm:mb-4 text-sm sm:text-base">
                {content[language].strategyTips.balance.title}
              </h4>
              <p className="text-stone-600 font-light leading-relaxed text-xs sm:text-sm">
                {content[language].strategyTips.balance.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
