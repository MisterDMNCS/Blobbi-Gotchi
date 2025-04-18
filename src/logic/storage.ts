import { State } from "../types/types";
import { debugLog } from "../utils/debugLog";

const STORAGE_KEY = "blobbiState";
const TIMEFACTOR_KEY = "blobbiTimeFactor";

/**
 * Saves the full Blobbi state into localStorage.
 */
export function saveState(state: State): void {
  debugLog(state.settings, "saveState");

  const saveData: State = {
    ...state,
    lastSaved: Date.now(), // ⏱ Speichere aktuellen Zeitpunkt
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));

  // ⏱️ Save timeFactor separately
  if (state.settings?.timeFactor !== undefined) {
    localStorage.setItem(TIMEFACTOR_KEY, state.settings.timeFactor.toString());
  }

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

  // 🔁 Restore timeFactor if available
  const savedTimeFactor = localStorage.getItem(TIMEFACTOR_KEY);
  if (savedTimeFactor && parsed.settings) {
    parsed.settings.timeFactor = parseFloat(savedTimeFactor);
  }

  const now = Date.now();
  const timePassedMs = now - (parsed.lastSaved ?? now); // 💡 lastSaved ist optional
  const passedSeconds = Math.floor(timePassedMs / 1000);
  const gameSpeed = 60 / Math.max(parsed.settings?.timeFactor ?? 1, 0.1);
  const passedHours = Math.floor(passedSeconds / gameSpeed);

  debugLog(parsed.settings, "mergeSavedStateWithDefaults");

  if (passedHours > 0) {
    parsed.hunger = Math.max(
      parsed.hunger - (parsed.settings.decayPerHour.hunger ?? 2) * passedHours,
      0
    );
    parsed.energy = Math.max(
      parsed.energy - (parsed.settings.decayPerHour.energy ?? 2) * passedHours,
      0
    );
    parsed.mood = Math.max(
      parsed.mood - (parsed.settings.decayPerHour.mood ?? 1) * passedHours,
      0
    );
    parsed.ageInHours += passedHours;
  }

  return { ...defaultState, ...parsed };
}
