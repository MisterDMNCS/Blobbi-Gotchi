import { State, Activity } from "../types/types";
import { debugLog } from "../utils/debugLog";
// import { findActivity } from "./controller"; // Removed as findActivity is defined locally

// 🔄 Numeric keys in State that can be affected by activity effects
const numericStateKeys: (keyof State)[] = [
  "hunger", "energy", "mood", "hygiene",
  "fitness", "health", "xp"
];

// 😄 Choose an emoji based on state
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

// 🔍 Find valid activities
export function findActivity(
  category: string,
  state: State
): [string, Activity][] {
  debugLog(state.settings, "findActivity");

  return Object.entries(state.activities).filter(
    ([_, activity]) =>
      activity.category === category &&
      state.level >= (activity.requiredXpLevel ?? 1) &&
      isStateAllowed(state, activity.avoidIf)
  );
}

// 🎯 Start a random activity from a category
export function startActivity(
  category: string,
  state: State
): {
  newState: State;
  activityEmoji: string;
  activityTitle: string;
  activityEffects: Record<string, number>;
} | null {
  debugLog(state.settings, "startActivity");

  const candidates = findActivity(category, state);
  if (candidates.length === 0) return null;

  const [emoji, activity] =
    candidates[Math.floor(Math.random() * candidates.length)];

  const newState: State = { ...state };

  for (const key in activity.effects) {
    const typedKey = key as keyof State;
  
    if (
      numericStateKeys.includes(typedKey) &&
      typeof newState[typedKey] === "number" &&
      typeof activity.effects[key] === "number"
    ) {
      const current = newState[typedKey] as number;
      const effect = activity.effects[key] as number;
      (newState as any)[typedKey] = Math.min(100, Math.max(0, current + effect));
    } else {
      console.warn("⚠️ Ungültiger Effektwert:", key, activity.effects[key]);
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
    activityEffects: activity.effects
  };
}

// 🚫 Check if state allows this activity
function isStateAllowed(
  state: State,
  rules: Record<string, string> = {}
): boolean {
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

// 🔄 Helpers
function randomEmoji(arr?: string[]): string {
  if (!arr || arr.length === 0) return "😐";
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDescription(arr?: string[]): string {
  if (!arr || arr.length === 0) return "";
  return arr[Math.floor(Math.random() * arr.length)];
}
