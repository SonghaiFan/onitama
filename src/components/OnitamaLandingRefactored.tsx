"use client";

import { useState, useRef } from "react";
import OnitamaGameRefactored from "@/components/OnitamaGameRefactored";
import { UnifiedHeader } from "@/components/Header";
import { CardPackSelection, CardPack } from "@/components/CardPackSelection";
import { GameOverview } from "@/components/GameOverview";
import { HowToPlay } from "@/components/HowToPlay";
import { Footer } from "@/components/Footer";
import { GameProvider } from "@/contexts/GameContext";
import { defaultGameController } from "@/utils/gameController";

type Language = "zh" | "en";

export default function OnitamaLandingRefactored() {
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
        <div className="h-dvh flex flex-col scroll-paper ink-wash">
          <UnifiedHeader
            language={language}
            mode="game"
            onBackToHome={() => setShowGame(false)}
            onNewGame={() => gameRef.current?.resetGame()}
          />
          <div className="flex-1 p-2 sm:p-4 lg:p-6 overflow-hidden">
            <div className="container mx-auto max-w-7xl h-full">
              <div className="zen-card h-full flex flex-col">
                <OnitamaGameRefactored
                  ref={gameRef}
                  cardPacks={getSelectedPacksForGame()}
                  language={language}
                />
              </div>
            </div>
          </div>
        </div>
      </GameProvider>
    );
  }

  return (
    <div className="min-h-dvh scroll-texture">
      <UnifiedHeader
        language={language}
        mode="landing"
        onToggleLanguage={toggleLanguage}
        onStartGame={() => setShowGame(true)}
      />

      <CardPackSelection
        language={language}
        selectedPacks={selectedPacks}
        onTogglePack={togglePack}
        onStartGame={() => setShowGame(true)}
      />

      <GameOverview language={language} />
      <HowToPlay language={language} />
      <Footer language={language} />
    </div>
  );
}
