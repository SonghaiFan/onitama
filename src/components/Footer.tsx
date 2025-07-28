import React from "react";
<<<<<<< Updated upstream:src/components/landing/Footer.tsx
import { content, Language } from "./content";
=======
import { content, Language } from "@/utils/content";
>>>>>>> Stashed changes:src/components/Footer.tsx

interface FooterProps {
  language: Language;
}

export function Footer({ language }: FooterProps) {
  return (
    <footer className="bg-stone-50 py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="brush-stroke mx-auto mb-4 sm:mb-6"></div>
        <p className="text-stone-500 font-light tracking-wide zen-text text-sm sm:text-base">
          {content[language].footer}
        </p>
      </div>
    </footer>
  );
}
