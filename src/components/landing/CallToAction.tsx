import React from "react";
import { content, Language } from "./content";
import { ZenButton } from "./shared";

interface CallToActionProps {
  language: Language;
  onStartGame: () => void;
}

export function CallToAction({ language, onStartGame }: CallToActionProps) {
  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-stone-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light mb-4 sm:mb-6 tracking-wide text-stone-100 zen-text">
          {content[language].readyToChallenge}
        </h2>
        <p className="text-lg sm:text-xl mb-8 sm:mb-12 text-stone-300 font-light leading-relaxed zen-text">
          {content[language].callToAction.subtitle}
        </p>
        <ZenButton
          onClick={onStartGame}
          className="text-lg sm:text-xl py-4 sm:py-6 px-12 sm:px-16 border-stone-400 text-stone-800"
        >
          {content[language].challengeStart}
        </ZenButton>
      </div>
    </section>
  );
}
