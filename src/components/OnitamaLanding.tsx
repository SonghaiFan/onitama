"use client";

import { useState, useRef, useEffect } from "react";
import OnitamaGame from "./OnitamaGame";
import { GameHeader } from "./landing/GameHeader";
import { LandingHeader } from "./landing/LandingHeader";
import { CardPackSelection } from "./landing/CardPackSelection";
import { GameOverview } from "./landing/GameOverview";
import { HowToPlay } from "./landing/HowToPlay";
import { CallToAction } from "./landing/CallToAction";
import { Footer } from "./landing/Footer";

type CardPack = "normal" | "senseis" | "windway" | "promo" | "dual";
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

  if (showGame) {
    return (
      <div className="h-dvh flex flex-col scroll-paper ink-wash">
        <GameHeader
          language={language}
          onBackToHome={() => setShowGame(false)}
          onNewGame={() => gameRef.current?.resetGame()}
        />
        <div className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6 overflow-hidden">
          <div className="container mx-auto max-w-7xl h-full">
            <div className="zen-card p-2 sm:p-4 lg:p-6 h-full flex flex-col">
              <OnitamaGame
                ref={gameRef}
                cardPacks={getSelectedPacksForGame()}
                language={language}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh scroll-texture">
      <LandingHeader
        language={language}
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
      <CallToAction language={language} onStartGame={() => setShowGame(true)} />
      <Footer language={language} />
    </div>
  );
}
