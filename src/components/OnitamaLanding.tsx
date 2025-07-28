"use client";

import { useState, useRef } from "react";
import OnitamaGame from "./OnitamaGame";
import { UnifiedHeader } from "./ui/Header";
import { CardPackSelection } from "./landing/CardPackSelection";
import { GameOverview } from "./landing/GameOverview";
import { HowToPlay } from "./landing/HowToPlay";
import { Footer } from "./ui/Footer";

type CardPack = "normal" | "senseis" | "windway" | "promo" | "dual" | "special";
type Language = "zh" | "en";

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

  return (
    <div
      className={
        showGame
          ? "h-dvh flex flex-col scroll-paper ink-wash"
          : "min-h-dvh scroll-texture"
      }
    >
      <UnifiedHeader
        language={language}
        mode={showGame ? "game" : "landing"}
        onToggleLanguage={toggleLanguage}
        onStartGame={() => setShowGame(true)}
        onBackToHome={() => setShowGame(false)}
        onNewGame={() => gameRef.current?.resetGame()}
      />

      {showGame ? (
        <div className="flex-1 p-2 sm:p-4 lg:p-6 overflow-hidden">
          <div className="container mx-auto max-w-7xl h-full">
            <div className="zen-card h-full flex flex-col">
              <OnitamaGame
                ref={gameRef}
                cardPacks={getSelectedPacksForGame()}
                language={language}
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          <CardPackSelection
            language={language}
            selectedPacks={selectedPacks}
            onTogglePack={togglePack}
          />
          <GameOverview language={language} />
          <HowToPlay language={language} />
          <Footer language={language} />
        </>
      )}
    </div>
  );
}
