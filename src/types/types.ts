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
  hunger: number;    // Hunger-Level (0 = sehr hungrig)
  energy: number;    // Energie-Level (0 = müde)
  mood: number;      // Laune
  hygiene: number;   // Sauberkeit
  knowledge: number; // Wissen
  fitness: number;   // Fitness
  social: number;    // Sozialverhalten
  money: number;     // Virtuelles Geld
  adventure: number; // Abenteuerlust
  health: number;    // Gesundheit (generell)

  // ⌛ Zeit & Fortschritt
  ageInHours: number; // Alter in Spielstunden
  level: number;      // Aktuelles Level
  xp: number;         // Aktuelle Erfahrungspunkte

  gameSpeed: number; // ⚙️ Für Kompatibilität (nicht mehr aktiv verwendet)

  // 😀 Anzeige
  currentEmoji: string;                 // Gesichtsausdruck
  activityEmoji: string;               // Emoji der aktuellen Aktivität
  currentActivity: string;             // Name der aktuellen Aktivität
  currentActivityDescription: string;  // Beschreibung der aktuellen Aktivität

  emotionEmojis: Record<string, string[]>; // Emoji-Sets je nach Stimmung

  // 🔁 Aktivitäten & Konfiguration
  activities: ActivityMap;   // Alle bekannten Aktivitäten (nach Emoji)
  settings: Settings;        // Spiel-Einstellungen (z. B. decay, timeFactor)

  // 💾 System
  lastSaved?: number;        // Letzter Speicherzeitpunkt (ms)
  isSleeping: boolean;       // 💤 Ist der Blobbi aktuell im Schlafmodus?
}

// 📊 Für die Aktivitätshistorie (lokal gespeichert)
export interface ActivityHistoryEntry {
  timestamp: string; // z. B. "14:32"
  emoji: string;     // z. B. "🍔"
  title: string;     // z. B. "Burger"
  effects: { icon: string; value: number }[]; // Liste der Auswirkungen
}
