import { State, Activity } from "../types/types";
import { debugLog } from "../utils/debugLog";

// 🔄 Numeric keys in State that can be affected by activity effects
const numericStateKeys: (keyof State)[] = [
  "hunger",
  "energy",
  "mood",
  "hygiene",
  "knowledge",
  "fitness",
  "social",
  "money",
  "adventure",
  "xp",
  "ageInHours",
  "gameSpeed",
  "level",
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
export function startActivity(category: string, state: State): State {
  debugLog(state.settings, "startActivity");

  const candidates = findActivity(category, state);
  if (candidates.length === 0) {
    console.warn("No matching activity found for:", category);
    return state;
  }

  const [emoji, activity] =
    candidates[Math.floor(Math.random() * candidates.length)];
  const newState: State = { ...state };

  for (const key in activity.effects || {}) {
    const typedKey = key as keyof State;

    if (numericStateKeys.includes(typedKey)) {
      const value = newState[typedKey];
      const effectValue = activity.effects[key];

      if (typeof value === "number" && typeof effectValue === "number") {
        (newState as any)[typedKey] = Math.max(
          0,
          Math.min(100, value + effectValue)
        );
      }
    }
  }

  newState.activityEmoji = emoji;
  newState.currentActivity = activity.title;
  const rawDescription = randomDescription(activity.descriptions);
  newState.currentActivityDescription = rawDescription.replace(
    "{blobbiName}",
    newState.name
  );

  return newState;
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
