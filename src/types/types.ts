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
  descriptions: string[];               // UI-Text (deutsch)
  avoidIf?: Record<string, string>;     // z. B. { energy: "<25" }
}

// 📚 Alle Aktivitäten, gemappt nach Emoji
export type ActivityMap = Record<string, Activity>;

// ⚙️ Einstellungen aus settings.json
export interface Settings {
  timeFactor: number;                     // ⏱ Steuerung der Spielgeschwindigkeit (Faktor)
  xpPerLevel: number;
  startLevel: number;
  selfActivityProbability: number;
  decayPerHour: Record<string, number>;
  debugLogs: boolean;
  activityHistoryEnabled: boolean;
  maxHistoryEntries: number;
}

// 🧬 Vollständiger Spielzustand
export interface State {
  name: string;

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

  ageInHours: number;
  level: number;
  xp: number;

  gameSpeed: number; // optional noch enthalten für gespeicherte Zustände

  currentEmoji: string;
  activityEmoji: string;
  currentActivity: string;
  currentActivityDescription: string;

  emotionEmojis: Record<string, string[]>;
  activities: ActivityMap;
  settings: Settings;

  lastSaved?: number;

}

// 📊 Für die Aktivitätshistorie (lokal gespeichert)
export interface ActivityHistoryEntry {
  timestamp: string; // z. B. "14:32"
  emoji: string;     // z. B. "🍔"
  title: string;     // z. B. "Burger"
  effects: { icon: string; value: number }[];
}
