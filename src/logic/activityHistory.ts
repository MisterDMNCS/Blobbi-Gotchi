import { ActivityHistoryEntry, Settings } from "../types/types";
import { debugLog } from "../utils/debugLog";

const HISTORY_KEY = "blobbiActivityHistory";

export function loadActivityHistory(): ActivityHistoryEntry[] {
  const data = localStorage.getItem(HISTORY_KEY);
  try {
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("⚠️ Failed to parse activity history:", e);
    return [];
  }
}

export function addActivityToHistory(
  entry: ActivityHistoryEntry,
  settings: Settings
): void {
  if (!settings.activityHistoryEnabled) return;

  const maxEntries = settings.maxHistoryEntries ?? 50;
  const current = loadActivityHistory();
  const updated = [entry, ...current].slice(0, maxEntries);

  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  debugLog(null, "✅ Activity saved to history", entry);
}
