export type Language = "zh" | "en";

// Bilingual content
export const content = {
  zh: {
    title: "意志與策略的對弈",
    subtitle:
      "二人對弈的抽象策略遊戲，在5×5的棋盤上展開。如象棋般的智慧較量，以獨特的移動卡牌系統創造無限變化。",
    cardPacks: {
      title: "選擇卡牌包",
      normal: {
        name: "標準包",
        description: "16張經典卡牌",
        selected: "✓ 已選擇",
        unselected: "點擊選擇",
      },
      senseis: {
        name: "大師之路",
        description: "16張進階卡牌",
        selected: "✓ 已選擇",
        unselected: "點擊選擇",
      },
      promo: {
        name: "限定包",
        description: "6張限定卡牌",
        selected: "✓ 已選擇",
        unselected: "點擊選擇",
      },
      windway: {
        name: "風之道",
        description: "風靈擴展包(8張風靈卡牌+2張移動卡牌)",
        selected: "✓ 已選擇",
        unselected: "點擊選擇",
      },
      dual: {
        name: "摹之道",
        description: "摹形擴展包(4張摹形卡牌)",
        selected: "✓ 已選擇",
        unselected: "點擊選擇",
      },
    },
    // Card validation messages
    cardValidation: {
      checking: "檢查卡牌中...",
      availableCards: "可用卡牌",
      needMoreCards: "需要至少5張卡牌",
      noPacksSelected: "未選擇卡牌包",
      failedToLoad: "載入失敗",
      invalidData: "卡牌數據無效",
      notEnoughCards: "卡牌不足",
    },
    startGame: "始める",
    newGame: "新局",
    backToHome: "返回首頁",
    musicOn: "音樂開啟",
    musicOff: "音樂關閉",
    gameOverview: "遊戲概覽",
    victoryPaths: "勝利之道",
    howToPlay: "遊戲方式",
    setup: "佈局",
    gameplay: "你的回合",
    strategy: "策略要點",
    readyToChallenge: "準備好挑戰形意棋了嗎？",
    challengeStart: "挑戰開始",
    footer: "形动有踪，意藏无形。",
    // Game features
    gameFeatures: {
      fast: "15分鐘對局",
      wisdom: "深度策略",
      victory: "雙重勝利",
    },
    // Victory paths
    victoryPathsDetail: {
      stone: {
        name: "石之道",
        description: "擒獲對手師傅",
      },
      stream: {
        name: "流之道",
        description: "師傅抵達敵方神殿",
      },
    },
    // Setup details
    setupDetails: {
      board: {
        title: "棋盤與棋子",
        description: "5×5棋盤設有神殿。每人持1師傅(♔)及4學徒(♙)。",
      },
      cards: {
        title: "移動牌",
        description: "每人持2張牌，1張共用牌放在中間。",
      },
      first: {
        title: "先手",
        description: "共用牌的顏色決定誰先手。",
      },
      windCards: {
        title: "風靈牌",
        description: "風靈牌有兩種移動模式：普通移動和風靈移動。",
      },
      dualCards: {
        title: "摹形卡牌",
        description: "摹形卡牌有兩種移動模式：師傅專用移動和學徒專用移動。",
      },
    },
    // Gameplay details
    gameplayDetails: {
      move: {
        title: "移動與攻擊",
        steps: [
          "選擇一張移動牌",
          "選擇要移動的棋子",
          "按牌片模式移動",
          "可越過但不可停在自己棋子上",
          "停在對手棋子上即捕獲",
        ],
      },
      exchange: {
        title: "交換牌片",
        steps: [
          "使用的牌放到對手右側",
          "拿取自己右側的交替牌",
          "五張牌在兩人間輪流使用",
          "三思而後行 - 對手將得到你的牌！",
        ],
      },
      windCards: {
        title: "風靈牌的使用",
        steps: [
          "風靈牌有兩種移動模式：普通移動和風靈移動",
          "雙階段移動：先移動你的棋子（師傅或學徒），再移動風靈",
          "如果棋子無法移動，跳過棋子移動階段",
          "如果風靈無法移動，跳過風靈移動階段",
          "風靈可移動到空位或與學徒交換位置",
          "風靈不能與師傅交換位置",
          "任何棋子都不能停在風靈上，風靈可以阻擋路徑",
        ],
      },
      dualCards: {
        title: "摹形卡牌使用",
        steps: [
          "師傅只能使用摹形卡牌的師傅移動模式",
          "學徒只能使用摹形卡牌的學徒移動模式",
          "移動模式在卡牌上以不同顏色標示",
          "其他規則與普通卡牌相同",
        ],
      },
    },
    // Strategy tips
    strategyTips: {
      think: {
        title: "深思熙慮",
        description: "每張你出的牌都會成為對手的武器。計畫要周全！",
      },
      center: {
        title: "掌控中心",
        description: "中央方格是攻守皆宜的強勢位置。",
      },
      balance: {
        title: "攻守平衡",
        description: "在保護自己師傅的同時威脅對手。",
      },
    },
    // Call to action
    callToAction: {
      subtitle: "在這優雅的策略遊戲中磨練你的心智",
    },
  },
  en: {
    title: "Will and Strategy in Battle",
    subtitle:
      "A two-player abstract strategy game played on a 5×5 board. Like chess, it tests wisdom through a unique movement card system that creates infinite variations.",
    cardPacks: {
      title: "Select Card Pack",
      normal: {
        name: "Standard Pack",
        description: "16 Classic Cards",
        selected: "✓ Selected",
        unselected: "Click to select",
      },
      senseis: {
        name: "Way of the Sensei",
        description: "16 Advanced Cards",
        selected: "✓ Selected",
        unselected: "Click to select",
      },
      promo: {
        name: "Promo Pack",
        description: "6 Limited Edition Cards",
        selected: "✓ Selected",
        unselected: "Click to select",
      },
      windway: {
        name: "Way of the Wind",
        description:
          "Wind Spirit Expansion Pack (8 spirit cards + 2 move cards)",
        selected: "✓ Selected",
        unselected: "Click to select",
      },
      dual: {
        name: "Way of the Mimicry",
        description: "Mimicry Expansion Pack (4 mimicry cards)",
        selected: "✓ Selected",
        unselected: "Click to select",
      },
    },
    // Card validation messages
    cardValidation: {
      checking: "Checking cards...",
      availableCards: "Available Cards",
      needMoreCards: "Need at least 5 cards",
      noPacksSelected: "No card packs selected",
      failedToLoad: "Failed to load",
      invalidData: "Invalid card data",
      notEnoughCards: "Not enough cards",
    },
    startGame: "Begin",
    newGame: "New Game",
    backToHome: "← Back to Home",
    musicOn: "Music On",
    musicOff: "Music Off",
    gameOverview: "Game Overview",
    victoryPaths: "Paths to Victory",
    howToPlay: "How to Play",
    setup: "Setup",
    gameplay: "Your Turn",
    strategy: "Strategy Tips",
    readyToChallenge: "Ready to challenge Onitama?",
    challengeStart: "Start Challenge",
    footer: "The form leaves a trace, the intent remains unseen.",
    // Game features
    gameFeatures: {
      fast: "15-Minute Games",
      wisdom: "Deep Strategy",
      victory: "Dual Victory",
    },
    // Victory paths
    victoryPathsDetail: {
      stone: {
        name: "Way of the Stone",
        description: "Capture the opponent's master",
      },
      stream: {
        name: "Way of the Stream",
        description: "Master reaches enemy temple",
      },
    },
    // Setup details
    setupDetails: {
      board: {
        title: "Board & Pieces",
        description:
          "5×5 board with temples. Each player has 1 master (♔) and 4 students (♙).",
      },
      cards: {
        title: "Movement Cards",
        description: "Each player holds 2 cards, 1 shared card in the center.",
      },
      first: {
        title: "First Move",
        description: "The shared card's color determines who goes first.",
      },
      windCards: {
        title: "Wind Spirit Cards",
        description:
          "Wind spirit cards have two movement patterns: regular moves and wind spirit moves. Use regular moves for your pieces, wind moves for the spirit.",
      },
      dualCards: {
        title: "Mimicry Cards",
        description:
          "Mimicry cards have two movement patterns: master-only moves and student-only moves.",
      },
    },
    // Gameplay details
    gameplayDetails: {
      move: {
        title: "Movement & Attack",
        steps: [
          "Select a movement card",
          "Choose a piece to move",
          "Move according to the card pattern",
          "Can pass over but cannot stop on your own pieces",
          "Stopping on opponent's piece captures it",
        ],
      },
      exchange: {
        title: "Exchange Cards",
        steps: [
          "Used card goes to opponent's right",
          "Take the exchange card from your right",
          "Five cards circulate between players",
          "Think twice - your opponent will get your card!",
        ],
      },
      windCards: {
        title: "Using Wind Spirit Cards",
        steps: [
          "Wind spirit cards have two movement patterns: regular moves and wind spirit moves",
          "Dual-phase movement: First move your piece (master or student), then move the wind spirit",
          "If your piece cannot move, skip the piece movement phase",
          "If the wind spirit cannot move, skip the wind spirit movement phase",
          "Wind spirit can move to empty squares or swap with students",
          "Wind spirit cannot swap with masters",
          "No piece can land on the wind spirit - it can block paths",
        ],
      },
      dualCards: {
        title: "Using Mimicry Cards",
        steps: [
          "Masters can only use the master movement pattern",
          "Students can only use the student movement pattern",
          "Movement patterns are shown in different colors on the card",
          "Other rules remain the same as regular cards",
        ],
      },
    },
    // Strategy tips
    strategyTips: {
      think: {
        title: "Deep Consideration",
        description:
          "Every card you play becomes your opponent's weapon. Plan carefully!",
      },
      center: {
        title: "Control the Center",
        description:
          "The center square is a strong position for both attack and defense.",
      },
      balance: {
        title: "Attack-Defense Balance",
        description: "Threaten your opponent while protecting your master.",
      },
    },
    // Call to action
    callToAction: {
      subtitle: "Hone your mind in this elegant strategy game",
    },
  },
};
