// src/types/types.ts

// 🔒 Erlaubte Felder, die durch Aktivitäten beeinflusst werden dürfen
export type StateEffectField =
  | "hunger"
  | "energy"
  | "mood"
  | "hygiene"
  | "knowledge"
  | "fitness"
  | "social"
  | "money"
  | "adventure"
  | "health"
  | "xp";

// 🧩 Eine einzelne Aktivität, die Blobbi ausführen kann
export interface Activity {
  title: string;                         // z. B. "Burger"
  category: string;                     // z. B. "food", "hygiene", ...
  requiredXpLevel: number;              // ab welchem Level verfügbar
  effects: Partial<Record<StateEffectField, number>>; // z. B. { hunger: +25, mood: +10 }
  descriptions: string[];               // UI-Text (deutsch), z. B. ["{blobbiName} isst einen Burger"]
  avoidIf?: Record<string, string>;     // z. B. { energy: "<25" } → Vermeidung bei Zustand
}

// 📚 Alle Aktivitäten, gemappt nach Emoji
export type ActivityMap = Record<string, Activity>;

// ⚙️ Einstellungen aus settings.json
export interface Settings {
  timeFactor: number;                     // ⏱ Spielgeschwindigkeit
  xpPerLevel: number;                     // XP pro Level
  startLevel: number;                     // Startlevel
  selfActivityProbability: number;        // (nicht mehr in Benutzung, optional)
  decayPerHour: Record<string, number>;   // Zustand-Verfall pro Spielstunde
  debugLogs: boolean;                     // Debug-Logging
  activityHistoryEnabled: boolean;        // Aktivitätshistorie aktiv?
  maxHistoryEntries: number;              // Verlaufslimit

  sleepThreshold: number;                 // 💤 Einschlafgrenze (z. B. 20)
  wakeThreshold: number;                  // 🌞 Aufwachgrenze (z. B. 80)
}


// 🧬 Vollständiger Spielzustand
export interface State {
  name: string; // Name des Blobbis (wird angezeigt & bearbeitet)

  // 🧠 Statuswerte (0–100)
  hunger: number;
  energy: number;
  mood: number;
  hygiene: number;
  knowledge: number;
  fitness: number;
  social: number;
  money: number;
  adventure: number;
  health: number;

  // ⌛ Zeit & Fortschritt
  blobbiClockMinutes: number;          // 🕒 Aktuelle Spieluhrzeit (0–1439 Minuten seit 00:00)
  blobbiDays: number;                  // 📆 Anzahl vergangener Blobbi-Tage
  blobbiClockStartTimestamp: number;  // ⏱ Startzeit (UNIX-Zeit in ms), zur Synchronisation mit Systemzeit bei Faktor 1

  level: number;
  xp: number;

  gameSpeed: number; // ⚙️ legacy

  // 😀 Anzeige
  currentEmoji: string;
  activityEmoji: string;
  currentActivity: string;
  currentActivityDescription: string;

  emotionEmojis: Record<string, string[]>;
  activities: ActivityMap;
  settings: Settings;

  // 💾 System
  lastSaved?: number;
  isSleeping: boolean;
}


// 📊 Für die Aktivitätshistorie (lokal gespeichert)
export interface ActivityHistoryEntry {
  timestamp: string;
  emoji: string;
  title: string;
  effects: { icon: string; value: number }[];
}
