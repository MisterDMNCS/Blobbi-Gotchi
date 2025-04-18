import { State, Activity } from "../types/types";
import { saveState } from "./storage";
import { updateEmoji, startActivity, isStateAllowed } from "./actions";
import { debugLog } from "../utils/debugLog";

// 🎯 Eine gültige Aktivität aus dem State filtern
export function findActivity(
  category: string,
  state: State
): [string, Activity][] {
  return Object.entries(state.activities).filter(
    ([_, activity]) =>
      activity.category === category &&
      state.level >= (activity.requiredXpLevel ?? 1) &&
      isStateAllowed(state, activity.avoidIf)
  );
}

export function startGameLoop(
  state: State,
  setState: React.Dispatch<React.SetStateAction<State>>
): number {
  debugLog(state.settings, "startGameLoop");

  return setInterval(() => {
    setState((prev) => {
      const updated: State = { ...prev };

      const decay = updated.settings?.decayPerHour ?? {
        hunger: 2,
        energy: 2,
        mood: 1,
      };

      updated.hunger = Math.max(0, updated.hunger - (decay.hunger ?? 0));
      updated.energy = Math.max(0, updated.energy - (decay.energy ?? 0));
      updated.mood = Math.max(0, updated.mood - (decay.mood ?? 0));
      updated.ageInHours += 1;

      updated.currentEmoji = updateEmoji(updated);

      const chance = updated.settings?.selfActivityProbability ?? 0;

      if (Math.random() < chance) {
        const categories = ["entertainment", "automatic"];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const newState = startActivity(category, updated);

        if (newState.activityEmoji) {
          updated.activityEmoji = newState.activityEmoji;
          updated.currentActivity = newState.currentActivity;
          updated.currentActivityDescription = newState.currentActivityDescription;

          Object.assign(updated, {
            hunger: newState.hunger,
            energy: newState.energy,
            mood: newState.mood,
            hygiene: newState.hygiene,
            fitness: newState.fitness,
            health: newState.health,
            knowledge: newState.knowledge,
            social: newState.social,
            money: newState.money,
            adventure: newState.adventure,
            xp: newState.xp,
            level: newState.level,
          });
        } else {
          updated.activityEmoji = "";
          updated.currentActivity = "nothing fits right now";
          updated.currentActivityDescription = "";
        }
      } else {
        updated.activityEmoji = "";
        updated.currentActivity = "not in the mood for anything";
        updated.currentActivityDescription = "";
      }

      saveState(updated);
      return updated;
    });
  }, state.settings?.gameSpeed * 1000 || 15000);
}
