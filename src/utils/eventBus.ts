type EventHandler<T = unknown> = (data: T) => void;

interface EventSubscription {
  id: string;
  handler: EventHandler<unknown>;
}

// AI Thinking Event Types
export interface AIThinkingUpdateEvent {
  score: number;
  nodesEvaluated: number;
  depth: number;
  elapsedTime: number;
  bestMoveFound?: {
    from: [number, number];
    to: [number, number];
    cardIndex: number;
  };
}

export interface AIThinkingStartEvent {
  player: string;
  difficulty: string;
}

export interface AIThinkingEndEvent {
  player: string;
  finalResult: {
    score: number;
    nodesEvaluated: number;
    depth: number;
    thinkingTime: number;
  };
}

/**
 * Event Bus for decoupled communication between components
 */
export class EventBus {
  private events: Map<string, EventSubscription[]> = new Map();
  private subscriptionId = 0;

  /**
   * Subscribe to an event
   */
  subscribe<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    const id = `sub_${++this.subscriptionId}`;
    const subscription: EventSubscription = { id, handler: handler as EventHandler<unknown> };

    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    this.events.get(event)!.push(subscription);

    // Return unsubscribe function
    return () => {
      const subscriptions = this.events.get(event);
      if (subscriptions) {
        const index = subscriptions.findIndex((sub) => sub.id === id);
        if (index !== -1) {
          subscriptions.splice(index, 1);
        }
        if (subscriptions.length === 0) {
          this.events.delete(event);
        }
      }
    };
  }

  /**
   * Publish an event
   */
  publish<T = unknown>(event: string, data?: T): void {
    const subscriptions = this.events.get(event);
    if (subscriptions) {
      subscriptions.forEach((subscription) => {
        try {
          subscription.handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Unsubscribe all listeners for an event
   */
  unsubscribeAll(event: string): void {
    this.events.delete(event);
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events.clear();
  }

  /**
   * Get number of subscribers for an event
   */
  getSubscriberCount(event: string): number {
    return this.events.get(event)?.length || 0;
  }
}

// Game-specific event types
export const GameEvents = {
  PIECE_SELECTED: "piece_selected",
  CARD_SELECTED: "card_selected",
  MOVE_EXECUTED: "move_executed",
  AI_MOVE_STARTED: "ai_move_started",
  AI_MOVE_COMPLETED: "ai_move_completed",
  AI_THINKING_UPDATE: "ai_thinking_update",
  AI_THINKING_START: "ai_thinking_start",
  AI_THINKING_END: "ai_thinking_end",
  GAME_STATE_CHANGED: "game_state_changed",
  GAME_RESET: "game_reset",
  WIN_CONDITION_MET: "win_condition_met",
  SOUND_PLAY: "sound_play",
  ANIMATION_START: "animation_start",
  ANIMATION_COMPLETE: "animation_complete",
} as const;

// Default event bus instance
export const gameEventBus = new EventBus();
export { gameEventBus as eventBus };
