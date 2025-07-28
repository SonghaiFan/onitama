import React from "react";
import { content, Language } from "@/utils/content";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { IconCircle } from "@/components/ui/IconCircle";
import Card from "@/components/MoveCards";
import { MoveCard, Player } from "@/types/game";
import { GameSymbol } from "@/utils/gameAestheticConfig";

interface HowToPlayProps {
  language: Language;
}

// Example cards for demonstration
const exampleCards: MoveCard[] = [
  {
    name: "eagle",
    displayName: "鷹",
    type: "wind_card",
    moves: [
      { x: -1, y: 1 },
      { x: 1, y: 1 },
    ],
    wind_move: [
      { x: -2, y: 2 },
      { x: 2, y: 2 },
    ],
    color: "red",
    isWindCard: true,
  },
  {
    name: "deer",
    displayName: "鹿",
    type: "mock_card",
    moves: [
      { x: -2, y: 2 },
      { x: 2, y: 2 },
    ],
    master_moves: [
      { x: -2, y: 2 },
      { x: 2, y: 2 },
    ],
    student_moves: [{ x: 0, y: 1 }],
    color: "blue",
    isMockCard: true,
  },
];

export function HowToPlay({ language }: HowToPlayProps) {
  const handleCardClick = (cardIndex: number, player: Player) => {
    // Demo function - no action needed for tutorial
  };

  return (
    <section className="py-16 sm:py-24 lg:py-32 scroll-paper zen-text text-stone-600">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-16 sm:mb-20 lg:mb-24">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-stone-800 mb-4 tracking-wide zen-text">
            {content[language].howToPlay}
          </h2>
          <div className="brush-stroke mx-auto"></div>
        </div>

        {/* Setup */}
        <div className="mb-16 sm:mb-20 lg:mb-24">
          <SectionTitle number="一" title={content[language].setup} />

          {/* Game Board and Pieces */}
          <div className="grid grid-cols-1 mx-10 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div className="zen-card p-6 sm:p-8 text-center">
              <IconCircle size="w-12 h-12 sm:w-16 sm:h-16">棋</IconCircle>
              <h4 className="font-medium text-stone-800 mb-3 sm:mb-4 text-sm sm:text-base">
                {content[language].setupDetails.board.title}
              </h4>
              <p className="text-stone-600 font-light leading-relaxed text-xs sm:text-sm">
                {content[language].setupDetails.board.description}
              </p>
              {/* Piece Symbols */}
              <div className="flex justify-center items-center space-x-6 mt-6">
                <div className="flex flex-col items-center">
                  <GameSymbol type="master" size="lg" player="red" />
                  <span className="text-sm text-stone-600 mt-2">師傅</span>
                </div>
                <div className="flex flex-col items-center">
                  <GameSymbol type="student" size="lg" player="red" />
                  <span className="text-sm text-stone-600 mt-2">學徒</span>
                </div>
                <div className="flex flex-col items-center">
                  <GameSymbol type="wind-spirit" size="lg" />
                  <span className="text-sm text-stone-600 mt-2">風靈</span>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Game Elements */}
          <div className="grid grid-cols-1 mx-10 md:grid-cols-2 gap-8 sm:gap-12 mb-8 sm:mb-12">
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

          {/* Special Card Packs */}
          <div className="grid grid-cols-2 mx-10 gap-8 sm:gap-12">
            <div className="zen-card p-6 sm:p-8 text-center">
              <IconCircle size="w-12 h-12 sm:w-16 sm:h-16">
                <GameSymbol type="wind-spirit" size="lg" />
              </IconCircle>
              <h4 className="font-medium text-stone-800 mb-3 sm:mb-4 text-sm sm:text-base">
                {content[language].setupDetails.windCards.title}
              </h4>
              <p className="text-stone-600 font-light leading-relaxed text-xs sm:text-sm">
                {content[language].setupDetails.windCards.description}
              </p>
              {/* Show wind spirit card example */}
              <div className="mt-6 flex justify-center">
                <Card
                  card={exampleCards[0]}
                  gridArea="wind-example"
                  isSelected={false}
                  playerOwner="red"
                  currentPlayer="red"
                  cardIndex={0}
                  onCardClick={handleCardClick}
                  language={language}
                />
              </div>
            </div>
            <div className="zen-card p-6 sm:p-8 text-center">
              <IconCircle size="w-12 h-12 sm:w-16 sm:h-16">
                <GameSymbol type="master" size="lg" player="red" />
              </IconCircle>
              <h4 className="font-medium text-stone-800 mb-3 sm:mb-4 text-sm sm:text-base">
                {content[language].setupDetails.dualCards.title}
              </h4>
              <p className="text-stone-600 font-light leading-relaxed text-xs sm:text-sm">
                {content[language].setupDetails.dualCards.description}
              </p>
              {/* Show dual card example */}
              <div className="mt-6 flex justify-center">
                <Card
                  card={exampleCards[1]}
                  gridArea="dual-example"
                  isSelected={false}
                  playerOwner="red"
                  currentPlayer="red"
                  cardIndex={1}
                  onCardClick={handleCardClick}
                  language={language}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Gameplay */}
        <div className="mb-16 sm:mb-20 lg:mb-24">
          <SectionTitle number="二" title={content[language].gameplay} />
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
        </div>

        {/* Strategy Tips */}
        <div className="mb-16 sm:mb-20 lg:mb-24">
          <SectionTitle number="三" title={content[language].strategy} />
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
