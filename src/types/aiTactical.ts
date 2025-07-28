export interface AITacticalConfig {
  metadata: {
    name: string;
    description: string;
    version: string;
    author: string;
  };
  
  // Difficulty-specific settings
  difficulties: {
    easy: DifficultyConfig;
    medium: DifficultyConfig;
  };
  
  // Core evaluation weights
  evaluation: {
    // Terminal conditions (game-ending)
    terminal: TerminalScores;
    
    // Material and piece values
    material: MaterialScores;
    
    // Positional evaluation
    positional: PositionalScores;
    
    // Tactical bonuses
    tactical: TacticalScores;
    
    // Move weighting for minimax
    moveWeighting: MoveWeightConfig;
    
    // Score normalization for UI display
    scoreDisplay: ScoreDisplayConfig;
  };
  
  // Algorithm parameters
  algorithm: {
    // Expectimax blending ratios
    expectimax: ExpectimaxConfig;
    
    // Search parameters
    search: SearchConfig;
    
    // Randomness and variance
    randomness: RandomnessConfig;
  };
}

export interface DifficultyConfig {
  maxDepth: number;
  maxThinkingTime: number; // milliseconds
  strategy: "random" | "minimax" | "mixed";
  randomnessRatio?: number; // For mixed strategy (0-1)
  minimaxDepth?: number; // For mixed strategy
}

export interface TerminalScores {
  masterCaptured: number;        // ±10000
  templeArchReached: number;     // ±10000
  masterCapturePriority: number; // 999
  templeArchPriority: number;    // 998
}

export interface MaterialScores {
  pieceValue: number;           // 150 per piece difference
  masterSafetyValue: number;    // 15 per nearby friendly piece
  masterSafetyRadius: number;   // 1 (adjacent squares)
}

export interface PositionalScores {
  // Master position evaluation
  masterProgress: number;       // 50 per row toward goal
  masterNearGoal: number;      // 100 bonus when close
  masterCenterColumn: number;  // 30 bonus for center column
  
  // Center control
  centerControl: number;       // 25 per center square
  centerPositions: Array<[number, number]>; // [[2,2], [1,2], etc.]
  masterCenterMultiplier: number; // 3 (vs 1 for students)
}

export interface TacticalScores {
  // Immediate tactical bonuses
  captureOpportunity: number;  // 30 per possible capture
  captureBonus: number;        // 500 immediate capture bonus
  flexibility: number;         // 5 per available move
  maxFlexibility: number;      // 50 max flexibility bonus
  
  // Master threats and safety
  masterThreatPenalty: number; // -1000 if master unsafe
}

export interface MoveWeightConfig {
  baseWeight: number;          // 1.0
  captureWeight: number;       // +0.5
  masterMoveWeight: number;    // +0.3
  centerWeight: number;        // +0.1 per distance from center
  maxCenterDistance: number;   // 4 (max distance bonus)
}

export interface ScoreDisplayConfig {
  // Score ranges for UI display
  clearWin: { min: number; max: number };      // 95-99
  clearLoss: { min: number; max: number };     // -99 to -95
  strongAdvantage: { min: number; max: number }; // 70-90
  strongDisadvantage: { min: number; max: number }; // -90 to -70
  normalRange: { min: number; max: number };   // -60 to +60
  
  // Variance and scaling
  normalScaling: number;       // 0.1 (score * 0.1)
  variance: number;           // 8 (±4 variance)
  strongAdvantageThreshold: number; // 500
  strongAdvantageScaling: number;   // /50
}

export interface ExpectimaxConfig {
  averageWeight: number;       // 0.7
  extremeWeight: number;       // 0.3 (max for maximizing, min for minimizing)
}

export interface SearchConfig {
  // Progress reporting
  updateFrequency: number;     // 4 (update every 1/4 of moves)
  confidenceCalculation: {
    base: number;             // 10 (depth * 10 for confidence)
    maxConfidence: number;    // 1.0
  };
}

export interface RandomnessConfig {
  // General randomness
  positionRandomness: number;  // 20 (±10 random variance)
  scoreBounds: { min: number; max: number }; // -2000 to +2000
  
  // Easy AI specific
  easyAI: {
    capturePreference: number; // 0.8 (80% capture preference)
    minimaxChance: number;     // 0.2 (20% minimax usage)
    thinkingDelay: number;     // 150ms
    
    // Score display variance for thinking updates
    displayVariance: {
      winning: number;         // 10
      losing: number;          // 10
      normal: number;          // 8
    };
  };
}

// Preset configurations for different AI personalities
export interface AIPresets {
  [presetName: string]: Partial<AITacticalConfig>;
}