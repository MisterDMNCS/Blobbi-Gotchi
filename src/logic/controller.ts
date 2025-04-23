import { State, Activity } from "../types/types";
import { saveState } from "./storage";
import { updateEmoji, startActivity, isStateAllowed } from "./actions";
import { debugLog } from "../utils/debugLog";
import { addActivityToHistory } from "./activityHistory";
import { effectIcons } from "../utils/effectIcons";
import { getBlobbiClock } from "../utils/time";

/**
 * Filters all activities in the given category that the Blobbi is allowed to perform.
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
 * Starts the main game loop using `setInterval`. Handles decay, activities and sleep mode.
 */
export function startGameLoop(
  state: State,
  setState: React.Dispatch<React.SetStateAction<State>>
): number {
  debugLog(state.settings, "startGameLoop");

  const timeFactor = state.settings?.timeFactor ?? 1;
  const gameSpeed = 60 / Math.max(timeFactor, 0.1);

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
      updated.blobbiClockMinutes = (updated.blobbiClockMinutes + 1) % 1440;
      if (updated.blobbiClockMinutes === 0) updated.blobbiDays += 1;
      
      updated.currentEmoji = updateEmoji(updated);

      const now = new Date();
      const timeString = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      // 💤 Sleep mode thresholds from settings
      const sleepThreshold = updated.settings?.sleepThreshold ?? 20;
      const wakeThreshold = updated.settings?.wakeThreshold ?? 80;

      // Wenn bereits im Schlafmodus → prüfen, ob er wach werden soll
      if (updated.isSleeping) {
        if (updated.energy >= wakeThreshold) {
          updated.isSleeping = false;
        } else {
          // Führe eine Aktivität aus der Kategorie "regenerate" aus
          const result = startActivity("regenerate", updated);
          if (result && result.activityEmoji) {
            const { newState, activityEmoji, activityTitle, activityEffects } = result;

            updated.activityEmoji = activityEmoji;
            updated.currentActivity = activityTitle;
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

            const effects = Object.entries(activityEffects).map(([key, value]) => ({
              icon: effectIcons[key] ?? "❓",
              value,
            }));

            addActivityToHistory(
              {
                timestamp: timeString,
                emoji: activityEmoji,
                title: activityTitle,
                effects,
              },
              updated.settings
            );

            saveState(updated);
            return updated;
          } else {
            // Falls keine gültige Regenerationsaktivität gefunden wurde
            updated.activityEmoji = "💤";
            updated.currentActivity = "Schlafen";
            updated.currentActivityDescription = `${updated.name} schläft weiter.`;

            addActivityToHistory(
              {
                timestamp: timeString,
                emoji: "💤",
                title: "Schlafen",
                effects: [],
              },
              updated.settings
            );

            saveState(updated);
            return updated;
          }
        }
      }

      // Energie zu niedrig → Schlafmodus aktivieren
      if (!updated.isSleeping && updated.energy < sleepThreshold) {
        updated.isSleeping = true;
        updated.activityEmoji = "💤";
        updated.currentActivity = "Schlafen";
        updated.currentActivityDescription = `${updated.name} ist erschöpft und schläft ein.`;

        addActivityToHistory(
          {
            timestamp: timeString,
            emoji: "💤",
            title: "Schlafen",
            effects: [],
          },
          updated.settings
        );

        saveState(updated);
        return updated;
      }

      // 🎮 Wach → Kategorie "entertainment"
      const result = startActivity("entertainment", updated);

      if (result && result.activityEmoji) {
        const { newState, activityEmoji, activityTitle, activityEffects } = result;

        updated.activityEmoji = activityEmoji;
        updated.currentActivity = activityTitle;
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

        const effects = Object.entries(activityEffects).map(([key, value]) => ({
          icon: effectIcons[key] ?? "❓",
          value,
        }));

        addActivityToHistory(
          {
            timestamp: timeString,
            emoji: activityEmoji,
            title: activityTitle,
            effects,
          },
          updated.settings
        );
      } else {
        updated.activityEmoji = "";
        updated.currentActivity = "Keine Lust!";
        updated.currentActivityDescription = "Vermutlich zu hungrig oder müde.";
      }

      saveState(updated);
      return updated;
    });
  }, gameSpeed * 1000);
}
