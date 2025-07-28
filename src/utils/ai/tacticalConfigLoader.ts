import { AITacticalConfig } from "@/types/aiTactical";

/**
 * Available tactical configuration presets
 */
export type TacticalPreset = "default" | "aggressive" | "defensive" | "custom";

/**
 * Cached configurations to avoid repeated loading
 */
const configCache = new Map<string, AITacticalConfig>();

/**
 * Default configuration fallback (embedded to ensure system always works)
 */
const FALLBACK_CONFIG: AITacticalConfig = {
  metadata: {
    name: "Fallback Configuration",
    description: "Emergency fallback configuration",
    version: "1.0.0",
    author: "System"
  },
  
  difficulties: {
    easy: {
      maxDepth: 1,
      maxThinkingTime: 1000,
      strategy: "mixed",
      randomnessRatio: 0.8,
      minimaxDepth: 1
    },
    medium: {
      maxDepth: 2,
      maxThinkingTime: 2000,
      strategy: "minimax"
    }
  },
  
  evaluation: {
    terminal: {
      masterCaptured: 10000,
      templeArchReached: 10000,
      masterCapturePriority: 999,
      templeArchPriority: 998
    },
    material: {
      pieceValue: 150,
      masterSafetyValue: 15,
      masterSafetyRadius: 1
    },
    positional: {
      masterProgress: 50,
      masterNearGoal: 100,
      masterCenterColumn: 30,
      centerControl: 25,
      centerPositions: [[2, 2], [1, 2], [2, 1], [2, 3], [3, 2]],
      masterCenterMultiplier: 3
    },
    tactical: {
      captureOpportunity: 30,
      captureBonus: 500,
      flexibility: 5,
      maxFlexibility: 50,
      masterThreatPenalty: 1000
    },
    moveWeighting: {
      baseWeight: 1.0,
      captureWeight: 0.5,
      masterMoveWeight: 0.3,
      centerWeight: 0.1,
      maxCenterDistance: 4
    },
    scoreDisplay: {
      clearWin: { min: 95, max: 99 },
      clearLoss: { min: -99, max: -95 },
      strongAdvantage: { min: 70, max: 90 },
      strongDisadvantage: { min: -90, max: -70 },
      normalRange: { min: -60, max: 60 },
      normalScaling: 0.1,
      variance: 8,
      strongAdvantageThreshold: 500,
      strongAdvantageScaling: 50
    }
  },
  
  algorithm: {
    expectimax: {
      averageWeight: 0.7,
      extremeWeight: 0.3
    },
    search: {
      updateFrequency: 4,
      confidenceCalculation: {
        base: 10,
        maxConfidence: 1.0
      }
    },
    randomness: {
      positionRandomness: 20,
      scoreBounds: { min: -2000, max: 2000 },
      easyAI: {
        capturePreference: 0.8,
        minimaxChance: 0.2,
        thinkingDelay: 150,
        displayVariance: {
          winning: 10,
          losing: 10,
          normal: 8
        }
      }
    }
  }
};

/**
 * Load tactical configuration from JSON file
 */
export async function loadTacticalConfig(preset: TacticalPreset = "default"): Promise<AITacticalConfig> {
  const cacheKey = `tactical-${preset}`;
  
  // Return cached config if available
  if (configCache.has(cacheKey)) {
    return configCache.get(cacheKey)!;
  }

  try {
    let configPath: string;
    
    switch (preset) {
      case "default":
        configPath = "/config/ai-tactical-default.json";
        break;
      case "aggressive":
        configPath = "/config/ai-tactical-aggressive.json";
        break;
      case "defensive":
        configPath = "/config/ai-tactical-defensive.json";
        break;
      case "custom":
        configPath = "/config/ai-tactical-custom.json";
        break;
      default:
        throw new Error(`Unknown tactical preset: ${preset}`);
    }

    const response = await fetch(configPath);
    
    if (!response.ok) {
      throw new Error(`Failed to load tactical config: ${response.status} ${response.statusText}`);
    }

    const loadedConfig = await response.json();
    
    // Merge with fallback config to ensure all properties exist
    const fullConfig = mergeConfigs(FALLBACK_CONFIG, loadedConfig);
    
    // Validate the configuration
    validateTacticalConfig(fullConfig);
    
    // Cache the result
    configCache.set(cacheKey, fullConfig);
    
    console.log(`✅ Loaded tactical config: ${fullConfig.metadata.name}`);
    return fullConfig;
    
  } catch (error) {
    console.warn(`⚠️ Failed to load tactical config '${preset}', using fallback:`, error);
    
    // Cache fallback to avoid repeated failures
    configCache.set(cacheKey, FALLBACK_CONFIG);
    return FALLBACK_CONFIG;
  }
}

/**
 * Deep merge two configurations, with override taking precedence
 */
function mergeConfigs(base: AITacticalConfig, override: Partial<AITacticalConfig>): AITacticalConfig {
  return {
    metadata: { ...base.metadata, ...override.metadata },
    difficulties: {
      easy: { ...base.difficulties.easy, ...override.difficulties?.easy },
      medium: { ...base.difficulties.medium, ...override.difficulties?.medium }
    },
    evaluation: {
      terminal: { ...base.evaluation.terminal, ...override.evaluation?.terminal },
      material: { ...base.evaluation.material, ...override.evaluation?.material },
      positional: { ...base.evaluation.positional, ...override.evaluation?.positional },
      tactical: { ...base.evaluation.tactical, ...override.evaluation?.tactical },
      moveWeighting: { ...base.evaluation.moveWeighting, ...override.evaluation?.moveWeighting },
      scoreDisplay: { ...base.evaluation.scoreDisplay, ...override.evaluation?.scoreDisplay }
    },
    algorithm: {
      expectimax: { ...base.algorithm.expectimax, ...override.algorithm?.expectimax },
      search: { ...base.algorithm.search, ...override.algorithm?.search },
      randomness: {
        ...base.algorithm.randomness,
        ...override.algorithm?.randomness,
        easyAI: { ...base.algorithm.randomness.easyAI, ...override.algorithm?.randomness?.easyAI }
      }
    }
  };
}

/**
 * Basic validation of tactical configuration
 */
function validateTacticalConfig(config: AITacticalConfig): void {
  const errors: string[] = [];
  
  // Validate difficulty settings
  if (config.difficulties.easy.maxDepth < 1) {
    errors.push("Easy AI maxDepth must be at least 1");
  }
  
  if (config.difficulties.medium.maxDepth < 1) {
    errors.push("Medium AI maxDepth must be at least 1");
  }
  
  // Validate evaluation weights are reasonable
  if (config.evaluation.material.pieceValue <= 0) {
    errors.push("Piece value must be positive");
  }
  
  if (config.evaluation.terminal.masterCaptured <= 0) {
    errors.push("Master capture value must be positive");
  }
  
  // Validate move weighting
  if (config.evaluation.moveWeighting.baseWeight <= 0) {
    errors.push("Base move weight must be positive");
  }
  
  // Validate expectimax weights sum correctly
  const expectimaxSum = config.algorithm.expectimax.averageWeight + config.algorithm.expectimax.extremeWeight;
  if (Math.abs(expectimaxSum - 1.0) > 0.01) {
    errors.push(`Expectimax weights should sum to 1.0, got ${expectimaxSum}`);
  }
  
  if (errors.length > 0) {
    throw new Error(`Tactical configuration validation failed:\n${errors.join('\n')}`);
  }
}

/**
 * Get current cached configuration or load default
 */
export function getCurrentTacticalConfig(): AITacticalConfig {
  return configCache.get("tactical-default") || FALLBACK_CONFIG;
}

/**
 * Clear configuration cache (useful for hot-reloading during development)
 */
export function clearTacticalConfigCache(): void {
  configCache.clear();
  console.log("🔄 Tactical configuration cache cleared");
}

/**
 * List available tactical presets
 */
export function getAvailablePresets(): TacticalPreset[] {
  return ["default", "aggressive", "defensive", "custom"];
}

/**
 * Create a custom configuration by merging a base preset with overrides
 */
export async function createCustomConfig(
  basePreset: TacticalPreset,
  overrides: Partial<AITacticalConfig>
): Promise<AITacticalConfig> {
  const baseConfig = await loadTacticalConfig(basePreset);
  const customConfig = mergeConfigs(baseConfig, overrides);
  
  // Update metadata
  customConfig.metadata = {
    ...customConfig.metadata,
    name: `Custom (based on ${baseConfig.metadata.name})`,
    description: "User-customized tactical configuration"
  };
  
  validateTacticalConfig(customConfig);
  
  // Cache the custom config
  configCache.set("tactical-custom", customConfig);
  
  return customConfig;
}

/**
 * Export configuration to JSON (for saving custom configs)
 */
export function exportTacticalConfig(config: AITacticalConfig): string {
  return JSON.stringify(config, null, 2);
}

/**
 * Import configuration from JSON string
 */
export async function importTacticalConfig(jsonString: string): Promise<AITacticalConfig> {
  try {
    const parsedConfig = JSON.parse(jsonString);
    const fullConfig = mergeConfigs(FALLBACK_CONFIG, parsedConfig);
    validateTacticalConfig(fullConfig);
    return fullConfig;
  } catch (error) {
    throw new Error(`Failed to import tactical configuration: ${error}`);
  }
}