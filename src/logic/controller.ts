import { State } from "../types/types";
import { saveState } from "./storage";
import { updateEmoji, startActivity } from "./actions";
import { debugLog } from "../utils/debugLog";
import React from "react";

// ✅ All numeric keys in State that can be updated dynamically
const numericKeys: (keyof State)[] = [
  "hunger",
  "energy",
  "mood",
  "hygiene",
  "knowledge",
  "fitness",
  "social",
  "money",
  "adventure",
  "xp",
  "ageInHours",
  "gameSpeed",
  "level"
];

export function startGameLoop(
  state: State,
  setState: React.Dispatch<React.SetStateAction<State>>
): number {
  debugLog(state.settings, "startGameLoop");

  return setInterval(() => {
    setState((prev) => {
      const updated: State = { ...prev };

      // 📉 Apply value decay per hour
      const decay = updated.settings?.decayPerHour || {
        hunger: 2,
        energy: 2,
        mood: 1
      };

      updated.hunger = Math.max(updated.hunger - decay.hunger, 0);
      updated.energy = Math.max(updated.energy - decay.energy, 0);
      updated.mood = Math.max(updated.mood - decay.mood, 0);
      updated.ageInHours += 1;

      // 😄 Update emoji
      updated.currentEmoji = updateEmoji(updated);

      // 🎯 Self-initiated activity
      const chance = updated.settings?.selfActivityProbability ?? 0;
      if (Math.random() < chance) {
        const categories = ["entertainment", "automatic"];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const newState = startActivity(category, updated);

        if (newState?.activityEmoji) {
          updated.activityEmoji = newState.activityEmoji;
          updated.currentActivity = newState.currentActivity;
          updated.currentActivityDescription = newState.currentActivityDescription;

          numericKeys.forEach((key) => {
            updated[key] = newState[key];
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
