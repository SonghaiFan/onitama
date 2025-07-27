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
        "game/miss",
        "game/hit",
        "ui/radio_select",
        "ui/window_close",
        "ui/window_open",
        "ui/tab_close",
        "ui/tab_open",
      ]}
    >
      {children}
    </ReactSoundsProvider>
  );
}
