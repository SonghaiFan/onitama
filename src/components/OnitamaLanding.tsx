"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import OnitamaGame from "./OnitamaGame";

export default function OnitamaLanding() {
  const [showGame, setShowGame] = useState(false);
  const gameRef = useRef<{ resetGame: () => void }>(null);

  if (showGame) {
    return (
      <div className="min-h-screen scroll-paper ink-wash p-8">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-6">
              <Image
                src="/Onitama_Logo.svg.png"
                alt="Onitama"
                width={200}
                height={60}
                className="object-contain zen-float"
              />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => gameRef.current?.resetGame()}
                className="zen-card border border-stone-400 text-stone-700 px-6 py-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 tracking-wide font-light"
              >
                新局
              </button>
              <button
                onClick={() => setShowGame(false)}
                className="zen-card border border-stone-400 text-stone-700 px-6 py-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 tracking-wide font-light"
              >
                ← 返回首頁
              </button>
            </div>
          </div>
          <div className="zen-card p-8">
            <OnitamaGame ref={gameRef} />
          </div>
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

      {/* How to Play - Zen Scroll Style */}
      <section className="py-32 bg-stone-25 watercolor-wash">
        <div className="container mx-auto px-8 max-w-4xl">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-light text-stone-800 mb-4 tracking-wide">
              遊戲方式
            </h2>
            <div className="w-24 h-px bg-stone-300 mx-auto"></div>
          </div>

          {/* Setup */}
          <div className="mb-24">
            <div className="flex items-center justify-center mb-12">
              <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center mr-4">
                <span className="text-stone-700 font-light">一</span>
              </div>
              <h3 className="text-3xl font-light text-stone-800 tracking-wide">
                佈局
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="zen-card p-8 text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl text-stone-600">棋</span>
                </div>
                <h4 className="font-medium text-stone-800 mb-4">棋盤與棋子</h4>
                <p className="text-stone-600 font-light leading-relaxed">
                  5×5棋盤設有神殿。每人持1師傅(♔)及4學徒(♙)。
                </p>
              </div>
              <div className="zen-card p-8 text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl text-stone-600">牌</span>
                </div>
                <h4 className="font-medium text-stone-800 mb-4">移動牌</h4>
                <p className="text-stone-600 font-light leading-relaxed">
                  每人持2張牌，1張共用牌放在中間。
                </p>
              </div>
              <div className="zen-card p-8 text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl text-stone-600">先</span>
                </div>
                <h4 className="font-medium text-stone-800 mb-4">先手</h4>
                <p className="text-stone-600 font-light leading-relaxed">
                  共用牌的顏色決定誰先手。
                </p>
              </div>
            </div>
          </div>

          {/* Gameplay */}
          <div className="mb-24">
            <div className="flex items-center justify-center mb-12">
              <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center mr-4">
                <span className="text-stone-700 font-light">二</span>
              </div>
              <h3 className="text-3xl font-light text-stone-800 tracking-wide">
                你的回合
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="zen-card p-10">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-lg text-stone-600">行</span>
                  </div>
                  <h4 className="font-medium text-stone-800 text-xl">
                    移動與攻擊
                  </h4>
                </div>
                <ul className="space-y-3 text-stone-600 font-light">
                  <li>• 選擇一張移動牌</li>
                  <li>• 選擇要移動的棋子</li>
                  <li>• 按牌片模式移動</li>
                  <li>• 可越過但不可停在自己棋子上</li>
                  <li>• 停在對手棋子上即捕獲</li>
                </ul>
              </div>
              <div className="zen-card p-10">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-lg text-stone-600">換</span>
                  </div>
                  <h4 className="font-medium text-stone-800 text-xl">
                    交換牌片
                  </h4>
                </div>
                <ul className="space-y-3 text-stone-600 font-light">
                  <li>• 使用的牌放到對手右側（對手下回合拿取）</li>
                  <li>• 拿取自己右側的共用牌</li>
                  <li>• 五張牌在兩人間輪流使用</li>
                  <li>• 三思而後行 - 對手將得到你的牌！</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Strategy Tips */}
          <div className="mb-24">
            <div className="flex items-center justify-center mb-12">
              <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center mr-4">
                <span className="text-stone-700 font-light">三</span>
              </div>
              <h3 className="text-3xl font-light text-stone-800 tracking-wide">
                策略要點
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="zen-card p-8 text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl text-stone-600">思</span>
                </div>
                <h4 className="font-medium text-stone-800 mb-4">深思熙慮</h4>
                <p className="text-stone-600 font-light leading-relaxed">
                  每張你出的牌都會成為對手的武器。計畫要周全！
                </p>
              </div>
              <div className="zen-card p-8 text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl text-stone-600">中</span>
                </div>
                <h4 className="font-medium text-stone-800 mb-4">掌控中心</h4>
                <p className="text-stone-600 font-light leading-relaxed">
                  中央方格是攻守皆宜的強勢位置。
                </p>
              </div>
              <div className="zen-card p-8 text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl text-stone-600">平</span>
                </div>
                <h4 className="font-medium text-stone-800 mb-4">攻守平衡</h4>
                <p className="text-stone-600 font-light leading-relaxed">
                  在保護自己師傅的同時威脅對手。
                </p>
              </div>
            </div>
          </div>

          {/* Game Controls */}
          <div className="zen-card p-12 mx-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-light text-stone-800 mb-4 tracking-wide">
                操作指南
              </h3>
              <div className="w-16 h-px bg-stone-300 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-3xl mx-auto">
              <div className="space-y-4">
                <h4 className="font-medium text-stone-800 mb-4">如何移動:</h4>
                <ol className="space-y-3 text-stone-600 font-light">
                  <li>1. 點擊一張移動牌選擇它</li>
                  <li>2. 點擊你的棋子(師傅或學徒)</li>
                  <li>3. 點擊綠色圓圈移動至該位置</li>
                  <li>4. 紅點表示可以擒獲對手棋子</li>
                </ol>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-stone-800 mb-4">視覺指示:</h4>
                <ul className="space-y-3 text-stone-600 font-light">
                  <li>🟦 藍色棋子 = 藍方</li>
                  <li>🟥 紅色棋子 = 紅方</li>
                  <li>♔ 皇冠 = 師傅</li>
                  <li>♙ 兵卒 = 學徒</li>
                  <li>⛩️ 神殿 = 勝利目標</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Zen Minimalist */}
      <section className="py-32 bg-stone-900 text-white">
        <div className="container mx-auto px-8 text-center max-w-3xl">
          <h2 className="text-4xl font-light mb-6 tracking-wide text-stone-100">
            風之道を極める時が来ましたか？
          </h2>
          <p className="text-xl mb-12 text-stone-300 font-light leading-relaxed">
            優雅な策略遊戲で自分を試してみてください
          </p>
          <button
            onClick={() => setShowGame(true)}
            className="zen-card border border-stone-400 text-stone-800 text-xl font-light py-6 px-16 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 tracking-widest"
          >
            挑戰開始
          </button>
        </div>
      </section>

      {/* Footer - Minimalist */}
      <footer className="bg-stone-50 py-16">
        <div className="container mx-auto px-8 text-center">
          <div className="w-32 h-px bg-stone-300 mx-auto mb-6"></div>
          <p className="text-stone-500 font-light tracking-wide">
            鬼王 — 古代戰術的芸術を体験する
          </p>
        </div>
      </footer>
    </div>
  );
}
