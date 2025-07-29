"use client";

import { SoundProvider as ReactSoundsProvider } from "react-sounds";

interface SoundProviderProps {
  children: React.ReactNode;
}

export function SoundProvider({ children }: SoundProviderProps) {
  return (
    <ReactSoundsProvider
      initialEnabled={true}
      preload={[
        "/sounds/move.mp3",
        "/sounds/capture.mp3",
        "/sounds/move-self.mp3",
        "/sounds/promote.mp3",
        "/sounds/wind.mp3",
      ]}
    >
      {children}
    </ReactSoundsProvider>
  );
}
