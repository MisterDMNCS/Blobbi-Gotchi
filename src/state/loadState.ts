import { State, ActivityMap, Settings } from "../types/types";
import { mergeSavedStateWithDefaults } from "../logic/storage";

/**
 * Loads all required JSON files and combines them into a fully initialized Blobbi state.
 */
export async function loadBlobbiState(): Promise<State> {
  const [settings, emojiData, food, hygiene, entertainment, automatic] =
    await Promise.all([
      fetch("/data/settings.json").then((res) => res.json()) as Promise<Settings>,
      fetch("/data/blobbiStates.json").then((res) => res.json()),
      fetch("/data/activities_food.json").then((res) => res.json()) as Promise<ActivityMap>,
      fetch("/data/activities_hygiene.json").then((res) => res.json()) as Promise<ActivityMap>,
      fetch("/data/activities_entertainment.json").then((res) => res.json()) as Promise<ActivityMap>,
      fetch("/data/activities_automatic.json").then((res) => res.json()) as Promise<ActivityMap>,
    ]);

  const activities: ActivityMap = {
    ...food,
    ...hygiene,
    ...entertainment,
    ...automatic,
  };

  const defaultState: State = {
    name: "{blobbiName}",

    hunger: 100,
    energy: 100,
    mood: 100,
    hygiene: 100,
    knowledge: 0,
    fitness: 0,
    social: 50,
    money: 20,
    adventure: 0,
    health: 100, // ✅ hinzugefügt

    ageInHours: 0,
    level: settings.startLevel,
    xp: 0,

    gameSpeed: 60, // ✅ Dummy-Wert, für Typkompatibilität (dynamisch verwendet)

    currentEmoji: "😄",
    activityEmoji: "",
    currentActivity: "",
    currentActivityDescription: "",

    emotionEmojis: emojiData.emotionEmojis,
    activities,
    settings,
  };

  return mergeSavedStateWithDefaults(defaultState);
}
