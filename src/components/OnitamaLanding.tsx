"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import OnitamaGame from "./OnitamaGame";

type CardPack = "normal" | "senseis";
type Language = "zh" | "en";

// Bilingual content
const content = {
  zh: {
    title: "意志與策略的對弈",
    subtitle:
      "二人對弈的抽象策略遊戲，在5×5的棋盤上展開。如象棋般的智慧較量，以獨特的移動卡牌系統創造無限變化。",
    cardPacks: {
      title: "選擇卡牌包",
      normal: {
        name: "標準包",
        description: "16張經典卡牌",
        selected: "✓ 已選擇",
        unselected: "點擊選擇",
      },
      senseis: {
        name: "大師之路",
        description: "16張進階卡牌",
        selected: "✓ 已選擇",
        unselected: "點擊選擇",
      },
    },
    startGame: "始める",
    newGame: "新局",
    backToHome: "← 返回首頁",
    gameOverview: "遊戲概覽",
    victoryPaths: "勝利之道",
    howToPlay: "遊戲方式",
    setup: "佈局",
    gameplay: "你的回合",
    strategy: "策略要點",
    readyToChallenge: "準備好挑戰形意棋了嗎？",
    challengeStart: "挑戰開始",
    footer: "形动有踪，意藏无形。",
    // Game features
    gameFeatures: {
      fast: "15分鐘對局",
      wisdom: "深度策略",
      victory: "雙重勝利",
    },
    // Victory paths
    victoryPathsDetail: {
      stone: {
        name: "石之道",
        description: "擒獲對手師傅",
      },
      stream: {
        name: "流之道",
        description: "師傅抵達敵方神殿",
      },
    },
    // Setup details
    setupDetails: {
      board: {
        title: "棋盤與棋子",
        description: "5×5棋盤設有神殿。每人持1師傅(♔)及4學徒(♙)。",
      },
      cards: {
        title: "移動牌",
        description: "每人持2張牌，1張共用牌放在中間。",
      },
      first: {
        title: "先手",
        description: "共用牌的顏色決定誰先手。",
      },
    },
    // Gameplay details
    gameplayDetails: {
      move: {
        title: "移動與攻擊",
        steps: [
          "選擇一張移動牌",
          "選擇要移動的棋子",
          "按牌片模式移動",
          "可越過但不可停在自己棋子上",
          "停在對手棋子上即捕獲",
        ],
      },
      exchange: {
        title: "交換牌片",
        steps: [
          "使用的牌放到對手右側（對手下回合拿取）",
          "拿取自己右側的共用牌",
          "五張牌在兩人間輪流使用",
          "三思而後行 - 對手將得到你的牌！",
        ],
      },
    },
    // Strategy tips
    strategyTips: {
      think: {
        title: "深思熙慮",
        description: "每張你出的牌都會成為對手的武器。計畫要周全！",
      },
      center: {
        title: "掌控中心",
        description: "中央方格是攻守皆宜的強勢位置。",
      },
      balance: {
        title: "攻守平衡",
        description: "在保護自己師傅的同時威脅對手。",
      },
    },
    // Call to action
    callToAction: {
      subtitle: "在這優雅的策略遊戲中磨練你的心智",
    },
  },
  en: {
    title: "Will and Strategy in Battle",
    subtitle:
      "A two-player abstract strategy game played on a 5×5 board. Like chess, it tests wisdom through a unique movement card system that creates infinite variations.",
    cardPacks: {
      title: "Select Card Pack",
      normal: {
        name: "Standard Pack",
        description: "16 Classic Cards",
        selected: "✓ Selected",
        unselected: "Click to select",
      },
      senseis: {
        name: "Way of the Sensei",
        description: "16 Advanced Cards",
        selected: "✓ Selected",
        unselected: "Click to select",
      },
    },
    startGame: "Begin",
    newGame: "New Game",
    backToHome: "← Back to Home",
    gameOverview: "Game Overview",
    victoryPaths: "Paths to Victory",
    howToPlay: "How to Play",
    setup: "Setup",
    gameplay: "Your Turn",
    strategy: "Strategy Tips",
    readyToChallenge: "Ready to challenge Onitama?",
    challengeStart: "Start Challenge",
    footer: "The form leaves a trace, the intent remains unseen.",
    // Game features
    gameFeatures: {
      fast: "15-Minute Games",
      wisdom: "Deep Strategy",
      victory: "Dual Victory",
    },
    // Victory paths
    victoryPathsDetail: {
      stone: {
        name: "Way of the Stone",
        description: "Capture the opponent's master",
      },
      stream: {
        name: "Way of the Stream",
        description: "Master reaches enemy temple",
      },
    },
    // Setup details
    setupDetails: {
      board: {
        title: "Board & Pieces",
        description:
          "5×5 board with temples. Each player has 1 master (♔) and 4 students (♙).",
      },
      cards: {
        title: "Movement Cards",
        description: "Each player holds 2 cards, 1 shared card in the center.",
      },
      first: {
        title: "First Move",
        description: "The shared card's color determines who goes first.",
      },
    },
    // Gameplay details
    gameplayDetails: {
      move: {
        title: "Movement & Attack",
        steps: [
          "Select a movement card",
          "Choose a piece to move",
          "Move according to the card pattern",
          "Can pass over but cannot stop on your own pieces",
          "Stopping on opponent's piece captures it",
        ],
      },
      exchange: {
        title: "Exchange Cards",
        steps: [
          "Used card goes to opponent's right (they take it next turn)",
          "Take the shared card from your right",
          "Five cards circulate between players",
          "Think twice - your opponent will get your card!",
        ],
      },
    },
    // Strategy tips
    strategyTips: {
      think: {
        title: "Deep Consideration",
        description:
          "Every card you play becomes your opponent's weapon. Plan carefully!",
      },
      center: {
        title: "Control the Center",
        description:
          "The center square is a strong position for both attack and defense.",
      },
      balance: {
        title: "Attack-Defense Balance",
        description: "Threaten your opponent while protecting your master.",
      },
    },
    // Call to action
    callToAction: {
      subtitle: "Hone your mind in this elegant strategy game",
    },
  },
};

// Reusable components
function IconCircle({
  children,
  size = "w-16 h-16",
  className = "",
}: {
  children: React.ReactNode;
  size?: string;
  className?: string;
}) {
  return (
    <div
      className={`${size} bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 ${className}`}
    >
      <span
        className="text-4xl text-stone-600"
        style={{ fontFamily: "DuanNing" }}
      >
        {children}
      </span>
    </div>
  );
}

function SectionTitle({
  number,
  title,
  lang,
}: {
  number: string;
  title: string;
  lang: Language;
}) {
  return (
    <div className="flex items-center justify-center mb-12">
      <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center mr-4">
        <span
          className="text-stone-700 font-light"
          style={{ fontFamily: "DuanNing" }}
        >
          {number}
        </span>
      </div>
      <h3 className="text-3xl font-light text-stone-800 tracking-wide zen-text">
        {title}
      </h3>
    </div>
  );
}

function CardPackButton({
  pack,
  isSelected,
  onClick,
  lang,
}: {
  pack: CardPack;
  isSelected: boolean;
  onClick: () => void;
  lang: Language;
}) {
  const packData = content[lang].cardPacks[pack];

  return (
    <button
      onClick={onClick}
      className={`relative zen-card border-2 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 sm:hover:-translate-y-2 tracking-wide font-light zen-text focus:focus-zen overflow-hidden ${
        isSelected
          ? "border-stone-600 text-stone-800 bg-gradient-to-br from-stone-50 to-stone-100 shadow-lg scale-105"
          : "border-stone-300 text-stone-600 hover:border-stone-500 hover:bg-stone-50"
      }`}
    >
      {isSelected && (
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[16px] sm:border-l-[20px] border-l-transparent border-t-[16px] sm:border-t-[20px] border-t-stone-600"></div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full transition-transform duration-700 group-hover:translate-x-full"></div>
      <div className="text-center relative z-10">
        <div className="text-base sm:text-lg font-medium mb-1 sm:mb-2">
          {packData.name}
        </div>
        <div className="text-xs sm:text-sm text-stone-500 mb-2 sm:mb-3">
          {packData.description}
        </div>
        <div className="text-xs text-stone-400">
          {isSelected ? packData.selected : packData.unselected}
        </div>
      </div>
    </button>
  );
}

function ZenButton({
  onClick,
  children,
  variant = "primary",
  className = "",
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const baseClasses =
    "zen-card border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 tracking-wide font-light zen-text focus:focus-zen";
  const variantClasses =
    variant === "primary"
      ? "border-stone-300 text-stone-800"
      : "border-stone-400 text-stone-700";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {children}
    </button>
  );
}

export default function OnitamaLanding() {
  const [showGame, setShowGame] = useState(false);
  const [selectedPacks, setSelectedPacks] = useState<Set<CardPack>>(
    new Set(["normal"])
  );
  const [language, setLanguage] = useState<Language>("zh");
  const gameRef = useRef<{ resetGame: () => void }>(null);

  const togglePack = (pack: CardPack) => {
    const newPacks = new Set(selectedPacks);
    if (newPacks.has(pack)) {
      newPacks.delete(pack);
      if (newPacks.size === 0) {
        newPacks.add("normal");
      }
    } else {
      newPacks.add(pack);
    }
    setSelectedPacks(newPacks);
  };

  const getSelectedPackForGame = (): CardPack => {
    return Array.from(selectedPacks)[0];
  };

  const toggleLanguage = () => {
    setLanguage((lang) => (lang === "zh" ? "en" : "zh"));
  };

  if (showGame) {
    return (
      <div className="min-h-screen scroll-paper ink-wash p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 lg:mb-12 gap-4 sm:gap-6">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <Image
                src="/Onitama_Logo.svg.png"
                alt="Onitama"
                width={160}
                height={48}
                className="object-contain zen-float sm:w-[200px] sm:h-[60px]"
              />
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <ZenButton
                onClick={() => gameRef.current?.resetGame()}
                variant="secondary"
                className="px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base"
              >
                {content[language].newGame}
              </ZenButton>
              <ZenButton
                onClick={() => setShowGame(false)}
                variant="secondary"
                className="px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base"
              >
                {content[language].backToHome}
              </ZenButton>
            </div>
          </div>
          <div className="zen-card p-4 sm:p-6 lg:p-8">
            <OnitamaGame
              ref={gameRef}
              cardPack={getSelectedPackForGame()}
              language={language}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-zinc-50 to-stone-100 scroll-texture">
      {/* Language Toggle */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
        <ZenButton
          onClick={toggleLanguage}
          variant="secondary"
          className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
        >
          {language === "zh" ? "EN" : "中文"}
        </ZenButton>
      </div>

      {/* Header */}
      <header className="text-center py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center w-full">
              <Image
                src="/Onitama_Logo.svg.png"
                alt="Onitama"
                width={200}
                height={60}
                className="object-contain sm:w-[260px] sm:h-[78px]"
                priority
              />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl lg:text-4xl text-stone-600 mb-8 sm:mb-12 lg:mb-16 font-light tracking-wide leading-relaxed zen-text">
            <span className="text-base sm:text-lg text-stone-500">
              {content[language].title}
            </span>
          </p>

          {/* Card Pack Selection */}
          <div className="mb-8 sm:mb-12">
            <h3 className="text-base sm:text-lg text-stone-700 mb-4 sm:mb-6 font-light tracking-wide zen-text">
              {content[language].cardPacks.title}
            </h3>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 lg:gap-8">
              <CardPackButton
                pack="normal"
                isSelected={selectedPacks.has("normal")}
                onClick={() => togglePack("normal")}
                lang={language}
              />
              <CardPackButton
                pack="senseis"
                isSelected={selectedPacks.has("senseis")}
                onClick={() => togglePack("senseis")}
                lang={language}
              />
            </div>
          </div>

          <ZenButton
            onClick={() => setShowGame(true)}
            className="text-base sm:text-lg py-4 sm:py-6 px-8 sm:px-12"
          >
            {content[language].startGame}
          </ZenButton>
        </div>
      </header>

      {/* Game Overview */}
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

      {/* How to Play */}
      <section className="py-16 sm:py-24 lg:py-32 bg-stone-25 scroll-paper">
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
              lang={language}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
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
          </div>

          {/* Gameplay */}
          <div className="mb-16 sm:mb-20 lg:mb-24">
            <SectionTitle
              number="二"
              title={content[language].gameplay}
              lang={language}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
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
            <SectionTitle
              number="三"
              title={content[language].strategy}
              lang={language}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
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

      {/* Call to Action */}
      <section className="py-16 sm:py-24 lg:py-32 bg-stone-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light mb-4 sm:mb-6 tracking-wide text-stone-100 zen-text">
            {content[language].readyToChallenge}
          </h2>
          <p className="text-lg sm:text-xl mb-8 sm:mb-12 text-stone-300 font-light leading-relaxed zen-text">
            {content[language].callToAction.subtitle}
          </p>
          <ZenButton
            onClick={() => setShowGame(true)}
            className="text-lg sm:text-xl py-4 sm:py-6 px-12 sm:px-16 border-stone-400 text-stone-800"
          >
            {content[language].challengeStart}
          </ZenButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-50 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="brush-stroke mx-auto mb-4 sm:mb-6"></div>
          <p className="text-stone-500 font-light tracking-wide zen-text text-sm sm:text-base">
            {content[language].footer}
          </p>
        </div>
      </footer>
    </div>
  );
}
