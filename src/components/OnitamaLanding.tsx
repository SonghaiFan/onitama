"use client";

import { useState } from "react";
import Image from "next/image";
import OnitamaGame from "./OnitamaGame";

export default function OnitamaLanding() {
  const [showGame, setShowGame] = useState(false);

  if (showGame) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Image
                src="/Onitama_Logo.svg.png"
                alt="Onitama"
                width={200}
                height={60}
                className="object-contain"
              />
            </div>
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
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-zinc-50 to-stone-100 scroll-texture">
      {/* Header - Zen Minimalism */}
      <header className="text-center py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Official Onitama Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/Onitama_Logo.svg.png"
              alt="Onitama"
              width={400}
              height={120}
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>
          <p className="text-2xl text-stone-600 mb-16 font-light tracking-wide leading-relaxed">
            風の道 <span className="text-lg text-stone-500">- The Way of the Wind</span>
          </p>
          <button
            onClick={() => setShowGame(true)}
            className="zen-card border border-stone-300 text-stone-800 text-lg font-light py-6 px-12 rounded-none transition-all duration-300 hover:shadow-xl hover:-translate-y-1 tracking-wider"
          >
            始める
          </button>
        </div>
      </header>

      {/* Game Overview - Vertical Scroll Layout */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-8 max-w-3xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-light text-stone-800 mb-4 tracking-wide">
              遊戲概覽
            </h2>
            <div className="w-24 h-px bg-stone-300 mx-auto"></div>
          </div>
          <div className="space-y-16">
            <div className="text-center">
              <p className="text-xl text-stone-600 mb-8 font-light leading-relaxed max-w-2xl mx-auto">
                二人對弈的抽象策略遊戲，在5×5的棋盤上展開。如象棋般的智慧較量，
                以獨特的移動卡牌系統創造無限變化。
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-stone-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-stone-600">速</span>
                  </div>
                  <span className="text-stone-700 font-light">15分鐘對局</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-stone-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-stone-600">智</span>
                  </div>
                  <span className="text-stone-700 font-light">深度策略</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-stone-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-stone-600">勝</span>
                  </div>
                  <span className="text-stone-700 font-light">雙重勝利</span>
                </div>
              </div>
            </div>
            <div className="zen-card p-12 mx-8">
              <h3 className="text-2xl font-light text-stone-800 mb-8 text-center">
                勝利之道
              </h3>
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-stone-200 rounded-full flex items-center justify-center">
                    <span className="text-lg text-stone-700">石</span>
                  </div>
                  <div>
                    <div className="font-medium text-stone-800 mb-1">
                      石之道
                    </div>
                    <div className="text-stone-600 font-light">
                      擒獲對手師傅
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-stone-200 rounded-full flex items-center justify-center">
                    <span className="text-lg text-stone-700">流</span>
                  </div>
                  <div>
                    <div className="font-medium text-stone-800 mb-1">
                      流之道
                    </div>
                    <div className="text-stone-600 font-light">
                      師傅抵達敵方神殿
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
                  <li>🟦 Blue pieces = Blue Player</li>
                  <li>🟥 Red pieces = Red Player</li>
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
