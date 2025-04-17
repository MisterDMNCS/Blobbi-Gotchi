// src/types/types.ts

// 🧩 Describes a single activity Blobbi can perform
export interface Activity {
  title: string; // e.g. "Burger"
  category: string; // e.g. "food", "hygiene", ...
  requiredXpLevel: number;
  effects: Record<string, number>; // e.g. { hunger: 20, mood: 10 }
  descriptions: string[]; // UI text in German
  avoidIf?: Record<string, string>; // e.g. { energy: "<25" }
}

// 📚 All activities mapped by emoji
export type ActivityMap = Record<string, Activity>;

// ⚙️ Settings from settings.json
export interface Settings {
  gameSpeed: number;
  xpPerLevel: number;
  startLevel: number;
  selfActivityProbability: number;
  decayPerHour: Record<string, number>; // formerly werteVerfallProStunde
  debugLogs: boolean;
}

// 🧬 Full game state object
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

  ageInHours: number;
  level: number;
  xp: number;

  gameSpeed: number;

  currentEmoji: string;
  activityEmoji: string;
  currentActivity: string;
  currentActivityDescription: string;

  emotionEmojis: Record<string, string[]>;
  activities: ActivityMap;
  settings: Settings;
}
