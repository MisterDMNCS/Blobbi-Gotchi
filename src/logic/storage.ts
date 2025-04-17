import { State } from "../types/types";
import { debugLog } from "../utils/debugLog";

const STORAGE_KEY = "blobbiState";

/**
 * Saves the full Blobbi state into localStorage.
 */
export function saveState(state: State): void {
  debugLog(state.settings, "saveState");

  const saveData = {
    ...state,
    lastSaved: Date.now()
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  console.log("✅ Blobbi state saved:", saveData);
}

/**
 * Merges saved localStorage state with default values
 * and applies time-based decay.
 */
export function mergeSavedStateWithDefaults(defaultState: State): State {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultState;

  const parsed: State = JSON.parse(saved);
  const now = Date.now();
  const timePassedMs = now - (parsed.lastSaved || now);
  const passedSeconds = Math.floor(timePassedMs / 1000);
  const passedHours = Math.floor(passedSeconds / parsed.gameSpeed);

  debugLog(parsed.settings, "mergeSavedStateWithDefaults");

  if (passedHours > 0) {
    parsed.hunger = Math.max(parsed.hunger - (parsed.settings.decayPerHour.hunger ?? 2) * passedHours, 0);
    parsed.energy = Math.max(parsed.energy - (parsed.settings.decayPerHour.energy ?? 2) * passedHours, 0);
    parsed.mood = Math.max(parsed.mood - (parsed.settings.decayPerHour.mood ?? 1) * passedHours, 0);
    parsed.ageInHours += passedHours;
  }

  return { ...defaultState, ...parsed };
}
