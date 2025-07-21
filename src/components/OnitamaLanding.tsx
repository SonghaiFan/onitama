"use client";

import { useState } from "react";
import OnitamaGame from "./OnitamaGame";

export default function OnitamaLanding() {
  const [showGame, setShowGame] = useState(false);

  if (showGame) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Onitama</h1>
            <button
              onClick={() => setShowGame(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
          <OnitamaGame />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <header className="text-center py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-6xl font-bold text-amber-900 mb-4">Onitama</h1>
          <p className="text-xl text-amber-700 mb-8">
            The Way of the Wind - A Strategic Board Game
          </p>
          <button
            onClick={() => setShowGame(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xl font-bold py-4 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🥋 Play Now
          </button>
        </div>
      </header>

      {/* Game Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Game Overview
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-lg text-gray-700 mb-4">
                Onitama is a two-player abstract strategy game that plays out on
                a 5×5 board. Think chess-lite with a unique twist: movement
                cards that rotate between players!
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⚡</span>
                  <span className="text-gray-700">Quick 15-minute games</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🧠</span>
                  <span className="text-gray-700">
                    Strategic depth with simple rules
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🎯</span>
                  <span className="text-gray-700">Two paths to victory</span>
                </div>
              </div>
            </div>
            <div className="bg-amber-100 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-amber-900 mb-4">
                Win Conditions
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <div className="font-semibold text-amber-800">
                      Way of the Stone
                    </div>
                    <div className="text-amber-700">
                      Capture your opponent's Master
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">⛩️</span>
                  <div>
                    <div className="font-semibold text-amber-800">
                      Way of the Stream
                    </div>
                    <div className="text-amber-700">
                      Move your Master to opponent's Temple Arch
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Play */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            How to Play
          </h2>

          {/* Setup */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                1
              </span>
              Setup
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-center mb-4">
                  <span className="text-3xl">🏟️</span>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Board & Pieces</h4>
                <p className="text-gray-600">
                  5×5 board with Temple Arches. Each player has 1 Master (♔) and
                  4 Students (♙).
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-center mb-4">
                  <span className="text-3xl">🃏</span>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Move Cards</h4>
                <p className="text-gray-600">
                  Each player gets 2 cards. 1 shared card sits between players.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-center mb-4">
                  <span className="text-3xl">🎲</span>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">
                  Starting Player
                </h4>
                <p className="text-gray-600">
                  The shared card's color determines who goes first.
                </p>
              </div>
            </div>
          </div>

          {/* Gameplay */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                2
              </span>
              Your Turn
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🚶</span>
                  Move & Attack
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Select one of your move cards</li>
                  <li>• Choose a piece to move (Master or Student)</li>
                  <li>• Move according to the card's pattern</li>
                  <li>• You can jump over pieces but not land on your own</li>
                  <li>• Landing on opponent's piece captures it</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🔄</span>
                  Exchange Cards
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li>
                    • Your used card rotates 180° and goes to the shared pile
                  </li>
                  <li>• Take the current shared card into your hand</li>
                  <li>• Cards continuously flow between players</li>
                  <li>• Think ahead - your opponent gets your card next!</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Strategy Tips */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                3
              </span>
              Strategy Tips
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-center mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Think Ahead</h4>
                <p className="text-gray-600">
                  Every card you play becomes accessible to your opponent. Plan
                  your moves carefully!
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-center mb-4">
                  <span className="text-3xl">⚡</span>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Control Center</h4>
                <p className="text-gray-600">
                  The center squares are powerful positions for both offense and
                  defense.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-center mb-4">
                  <span className="text-3xl">⚖️</span>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Balance</h4>
                <p className="text-gray-600">
                  Balance aggression and defense. Protect your Master while
                  threatening theirs.
                </p>
              </div>
            </div>
          </div>

          {/* Game Controls */}
          <div className="bg-blue-50 p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🎮 Game Controls
            </h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="space-y-3">
                <h4 className="font-bold text-blue-800">How to Make a Move:</h4>
                <ol className="space-y-2 text-blue-700">
                  <li>1. Click on one of your move cards to select it</li>
                  <li>
                    2. Click on your piece (Master or Student) to select it
                  </li>
                  <li>3. Click on a highlighted green circle to move there</li>
                  <li>
                    4. Red dots indicate you can capture an opponent's piece
                  </li>
                </ol>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-blue-800">Visual Indicators:</h4>
                <ul className="space-y-2 text-blue-700">
                  <li>🟦 Blue pieces = Player 1</li>
                  <li>🟥 Red pieces = Player 2</li>
                  <li>♔ Crown = Master piece</li>
                  <li>♙ Pawn = Student piece</li>
                  <li>⛩️ Temple Arch = Victory target</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-amber-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Master the Way of the Wind?
          </h2>
          <p className="text-xl mb-8 text-amber-100">
            Challenge yourself with this elegant strategy game
          </p>
          <button
            onClick={() => setShowGame(true)}
            className="bg-white text-amber-600 hover:bg-amber-50 text-xl font-bold py-4 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🥋 Start Playing Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            Onitama - Experience the ancient art of strategic combat
          </p>
        </div>
      </footer>
    </div>
  );
}
