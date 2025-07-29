"use client";

import { SoundProvider as ReactSoundsProvider } from "react-sounds";

interface SoundProviderProps {
  children: React.ReactNode;
}

export function SoundProvider({ children }: SoundProviderProps) {
  return (
    <ReactSoundsProvider
      initialEnabled={true}
      // Removed preload to prevent 404 errors for missing sound files
    >
      {children}
    </ReactSoundsProvider>
  );
}
