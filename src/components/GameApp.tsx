"use client";

import { useGameStore } from "@/store/gameStore";
import LandingPage from "./LandingPage";
import OnitamaGame from "./OnitamaGame";
import SettingsPage from "./SettingsPage";
import GameMenu from "./GameMenu";

export default function GameApp() {
  const { currentScreen } = useGameStore();

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case "landing":
        return <LandingPage />;
      case "game":
        return (
          <>
            <GameMenu />
            <OnitamaGame />
          </>
        );
      case "settings":
        return <SettingsPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/20 to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl"></div>

      {/* Main content */}
      <div className="relative z-10">{renderCurrentScreen()}</div>
    </div>
  );
}
