import { State, StateEffectField } from "../types/types";
import { debugLog } from "../utils/debugLog";
import { findActivity } from "./controller";

// 🔁 Helpers for random emoji/description
function randomEmoji(arr?: string[]): string {
  if (!arr || arr.length === 0) return "😐";
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDescription(arr?: string[]): string {
  if (!arr || arr.length === 0) return "";
  return arr[Math.floor(Math.random() * arr.length)];
}

// 😄 Emoji selection based on mood/state
export function updateEmoji(state: State): string {
  debugLog(state.settings, "updateEmoji");

  const { hunger, energy, mood, fitness, emotionEmojis } = state;

  if (hunger < 20) return randomEmoji(emotionEmojis.hungry);
  if (energy < 20) return randomEmoji(emotionEmojis.tired);
  if (mood < 20) return randomEmoji(emotionEmojis.sad);
  if (energy > 90 && mood > 80) return randomEmoji(emotionEmojis.happy);
  if (fitness > 80) return randomEmoji(emotionEmojis.cool);
  if (Math.random() < 0.1) return randomEmoji(emotionEmojis.playful);

  return randomEmoji(emotionEmojis.neutral);
}

// 🎯 Apply an activity from a category and return new state
export function startActivity(category: string, state: State): {
  newState: State;
  activityEmoji: string;
  activityTitle: string;
  activityEffects: Record<string, number>;
} | null {
  debugLog(state.settings, "startActivity");

  const candidates = findActivity(category, state);
  if (candidates.length === 0) {
    console.warn(`⚠️ Keine passende Aktivität für Kategorie "${category}"`);
    return null;
  }

  const [emoji, activity] = candidates[Math.floor(Math.random() * candidates.length)];
  const newState: State = { ...state };
  const activityEffects: Record<string, number> = {};

  for (const [key, effectValue] of Object.entries(activity.effects) as [StateEffectField, number][]) {
    if (
      typeof newState[key] === "number" &&
      typeof effectValue === "number" &&
      !isNaN(effectValue)
    ) {
      const current = newState[key] as number;
      newState[key] = Math.min(100, Math.max(0, current + effectValue));
      activityEffects[key] = effectValue; // Record for UI
    } else {
      console.warn(`⚠️ Ungültiger Effekt für "${key}":`, effectValue);
    }
  }

  newState.activityEmoji = emoji;
  newState.currentActivity = activity.title;
  newState.currentActivityDescription = randomDescription(activity.descriptions).replace(
    "{blobbiName}",
    newState.name
  );

  return {
    newState,
    activityEmoji: emoji,
    activityTitle: activity.title,
    activityEffects,
  };
}


// 🚫 Rule check for avoidIf logic (e.g. { mood: "<40" })
export function isStateAllowed(state: State, rules: Record<string, string> = {}): boolean {
  debugLog(state.settings, "isStateAllowed");

  return Object.entries(rules).every(([key, condition]) => {
    if (!(key in state)) return true;

    const threshold = parseInt(condition.slice(1));
    const op = condition[0];
    const value = state[key as keyof State];

    if (typeof value !== "number") return true;

    if (op === "<") return value >= threshold;
    if (op === ">") return value <= threshold;
    if (op === "=") return value === threshold;

    return true;
  });
}
