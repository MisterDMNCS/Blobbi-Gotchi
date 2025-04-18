import { State, Activity } from "../types/types";
import { saveState } from "./storage";
import { updateEmoji, startActivity, isStateAllowed } from "./actions";
import { debugLog } from "../utils/debugLog";

/**
 * Filters all activities in the given category that the Blobbi is allowed to perform.
 *
 * @param category - The activity category to search in (e.g., "entertainment", "automatic")
 * @param state - The current game state
 * @returns A list of [key, activity] pairs that are valid for the given state
 */
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

/**
 * Starts the main game loop using `setInterval`. It simulates the passage of time
 * by updating state attributes like hunger, energy, and mood. It also determines
 * whether the Blobbi will perform an automatic activity based on probability.
 *
 * @param state - The initial state of the game
 * @param setState - A React state setter to update the game state
 * @returns The interval ID so it can be cleared later if needed
 */
export function startGameLoop(
  state: State,
  setState: React.Dispatch<React.SetStateAction<State>>
): number {
  debugLog(state.settings, "startGameLoop");

  // Zeitfaktor in Spielgeschwindigkeit umrechnen (Sekunden pro Blobbi-Stunde)
  const timeFactor = state.settings?.timeFactor ?? 1;
  const gameSpeed = 60 / Math.max(timeFactor, 0.1);

  return setInterval(() => {
    setState((prev) => {
      const updated: State = { ...prev };

      // Apply hourly decay values from settings or use defaults
      const decay = updated.settings?.decayPerHour ?? {
        hunger: 2,
        energy: 2,
        mood: 1,
      };

      updated.hunger = Math.max(0, updated.hunger - (decay.hunger ?? 0));
      updated.energy = Math.max(0, updated.energy - (decay.energy ?? 0));
      updated.mood = Math.max(0, updated.mood - (decay.mood ?? 0));
      updated.ageInHours += 1;

      // Update Blobbi's facial expression
      updated.currentEmoji = updateEmoji(updated);

      // Decide whether Blobbi should perform an automatic activity
      const chance = updated.settings?.selfActivityProbability ?? 0;

      if (Math.random() < chance) {
        const categories = ["entertainment", "automatic"];
        const category =
          categories[Math.floor(Math.random() * categories.length)];
        const result = startActivity(category, updated);

        if (result && result.activityEmoji) {
          const { newState, activityEmoji, activityTitle } =
            result;

          updated.activityEmoji = activityEmoji;
          updated.currentActivity = activityTitle;
          updated.currentActivityDescription =
            newState.currentActivityDescription;

          // Copy effect fields from the newState (cloned version)
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
          // No valid activity found
          updated.activityEmoji = "";
          updated.currentActivity = "nothing fits right now";
          updated.currentActivityDescription = "";
        }
      } else {
        // Blobbi chose not to do anything
        updated.activityEmoji = "";
        updated.currentActivity = "not in the mood for anything";
        updated.currentActivityDescription = "";
      }

      saveState(updated);
      return updated;
    });
  }, gameSpeed * 1000); // Faktor: 1 = 60s, 10 = 6s pro Tick
}
