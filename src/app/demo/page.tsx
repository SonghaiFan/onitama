"use client";

import { useState } from "react";
import OnitamaLanding from "@/components/OnitamaLanding";
import OnitamaLandingRefactored from "@/components/OnitamaLandingRefactored";

export default function DemoPage() {
  const [version, setVersion] = useState<"original" | "refactored">(
    "original"
  );

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Version Selector */}
      <div className="fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg border border-stone-300 shadow-lg p-4">
        <h3 className="text-sm font-medium text-stone-700 mb-2">
          Architecture Comparison
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setVersion("original")}
            className={`px-3 py-1.5 text-xs rounded border transition-colors ${
              version === "original"
                ? "border-stone-600 bg-stone-100 text-stone-800"
                : "border-stone-300 bg-white text-stone-600 hover:border-stone-400"
            }`}
          >
            Legacy
          </button>
          <button
            onClick={() => setVersion("refactored")}
            className={`px-3 py-1.5 text-xs rounded border transition-colors ${
              version === "refactored"
                ? "border-stone-600 bg-stone-100 text-stone-800"
                : "border-stone-300 bg-white text-stone-600 hover:border-stone-400"
            }`}
          >
            New
          </button>
        </div>
        <div className="mt-2 text-xs text-stone-500">
          {version === "refactored"
            ? "✅ New architecture: Working AI, centralized state, clean separation"
            : "❌ Legacy architecture: Broken AI, scattered state, prop drilling"}
        </div>
      </div>

      {/* Render the selected version */}
      {version === "original" ? (
        <OnitamaLanding />
      ) : (
        <OnitamaLandingRefactored />
      )}
    </div>
  );
}
