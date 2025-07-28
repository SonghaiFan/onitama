"use client";

import { useState, useRef } from "react";
import OnitamaGame from "@/components/OnitamaGame";
import { Header } from "@/components/Header";
import { CardPackSelection } from "@/components/CardPackSelection";
import { CardPack } from "@/types/game";
import { GameOverview } from "@/components/GameOverview";
import { HowToPlay } from "@/components/HowToPlay";
import { Footer } from "@/components/Footer";
import { GameProvider, useGame } from "@/contexts/GameContext";
import { defaultGameController } from "@/utils/gameController";

type Language = "zh" | "en";

// Game page component that has access to GameContext
function GamePage({
  language,
  onBackToHome,
  gameRef,
  cardPacks,
  selectedPacks,
}: {
  language: Language;
  onBackToHome: () => void;
  gameRef: React.RefObject<{ resetGame: () => void } | null>;
  cardPacks: CardPack[];
  selectedPacks: Set<CardPack>;
}) {
  const { aiPlayer, setAIPlayer, config, updateAIConfig } = useGame();

  return (
    <div className="h-dvh flex flex-col scroll-paper ink-wash">
      <Header
        language={language}
        mode="game"
        onBackToHome={onBackToHome}
        onNewGame={() => gameRef.current?.resetGame()}
        aiEnabled={aiPlayer !== null}
        onSetAIEnabled={(enabled) => setAIPlayer(enabled ? "blue" : null)}
        aiDifficulty={config.aiDifficulty}
        onDifficultyChange={(difficulty) =>
          updateAIConfig({ aiDifficulty: difficulty })
        }
        selectedPacks={selectedPacks}
      />
      <div className="flex-1 p-2 sm:p-4 lg:p-6 overflow-hidden">
        <div className="container mx-auto max-w-7xl h-full">
          <div className="zen-card h-full flex flex-col">
            <OnitamaGame
              ref={gameRef}
              cardPacks={cardPacks}
              language={language}
            />
          </div>
        </div>
      </div>
    </div>
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

  const getSelectedPacksForGame = (): CardPack[] => {
    return Array.from(selectedPacks);
  };

  const toggleLanguage = () => {
    setLanguage((lang) => (lang === "zh" ? "en" : "zh"));
  };

  if (showGame) {
    return (
      <GameProvider controller={defaultGameController}>
        <GamePage
          language={language}
          onBackToHome={() => setShowGame(false)}
          gameRef={gameRef}
          cardPacks={getSelectedPacksForGame()}
          selectedPacks={selectedPacks}
        />
      </GameProvider>
    );
  }

  return (
    <div className="min-h-dvh scroll-texture">
      <Header
        language={language}
        mode="landing"
        onToggleLanguage={toggleLanguage}
        onStartGame={() => setShowGame(true)}
      />

      <CardPackSelection
        language={language}
        selectedPacks={selectedPacks}
        onTogglePack={togglePack}
      />

      <GameOverview language={language} />
      <HowToPlay language={language} />
      <Footer language={language} />
    </div>
  );
}
