import { State, ActivityMap, Settings } from "../types/types";
import { mergeSavedStateWithDefaults } from "../logic/storage";

/**
 * Initialisiert das Spiel, indem alle benötigten JSON-Daten geladen werden
 * und daraus ein vollständig vorbereiteter State erzeugt wird.
 */
export async function loadBlobbiState(): Promise<State> {
  // ⬇️ Lade Settings, Emoji-Daten und alle Aktivitäten aus /public/data
  const [settings, emojiData, food, hygiene, entertainment, regenerate] =
    await Promise.all([
      fetch("/data/settings.json").then((res) => res.json()) as Promise<Settings>,
      fetch("/data/blobbiStates.json").then((res) => res.json()),
      fetch("/data/activities_food.json").then((res) => res.json()) as Promise<ActivityMap>,
      fetch("/data/activities_hygiene.json").then((res) => res.json()) as Promise<ActivityMap>,
      fetch("/data/activities_entertainment.json").then((res) => res.json()) as Promise<ActivityMap>,
      fetch("/data/activities_regenerate.json").then((res) => res.json()) as Promise<ActivityMap>,
    ]);

  // 🔁 Kombiniere alle Aktivitäten in eine einzige Map
  const activities: ActivityMap = {
    ...food,
    ...hygiene,
    ...entertainment,
    ...regenerate,
  };

  // 🕒 Aktuelle Uhrzeit
  const now = new Date();
  const clockMinutes = now.getHours() * 60 + now.getMinutes();
  const startTimestamp = now.getTime(); // ⏱ Unix-Zeit in Millisekunden

  // 🧬 Initialer Blobbi-Zustand
  const defaultState: State = {
    name: "{blobbiName}",

    // Statuswerte
    hunger: 100,
    energy: 100,
    mood: 100,
    hygiene: 100,
    knowledge: 0,
    fitness: 0,
    social: 50,
    money: 20,
    adventure: 0,
    health: 100,

    // Uhrzeit und Alter
    blobbiClockMinutes: clockMinutes,          // 🕒 Minuten seit Mitternacht
    blobbiClockStartTimestamp: startTimestamp, // 📍 Exakter Startzeitpunkt
    blobbiDays: 0,                             // 📆 Starttag = 0

    // Fortschritt
    level: settings.startLevel,
    xp: 0,

    // Kompatibilität
    gameSpeed: 60,

    // Anzeige
    currentEmoji: "🎁",
    activityEmoji: "",
    currentActivity: "",
    currentActivityDescription: "",

    // Daten
    emotionEmojis: emojiData.emotionEmojis,
    activities,
    settings,

    // Intern
    isSleeping: false,
  };

  // 🔁 Lade ggf. gespeicherten Zustand hinzu (bei Reload)
  return mergeSavedStateWithDefaults(defaultState);
}
