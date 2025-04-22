/**
 * MainScene.tsx
 * ------------------------------
 * Hauptansicht des Spiels "Blobbi Gotchi".
 * Enthält den Avatar, die Tick-Logik, Menü, Fortschrittsbalken und Aktivitätenauswahl.
 * 
 * Kernfunktionen:
 * - Lädt den Spielzustand beim Start
 * - Startet den GameLoop (Tick)
 * - Steuert die Fortschrittsanzeige synchron zum GameLoop
 * - Zeigt aktuellen Zustand und Aktivität des Blobbi
 * - Ermöglicht Benutzerinteraktionen über Menü und Buttons
 */

import { useEffect, useState } from "react";
import { loadBlobbiState } from "../state/loadState";
import { startActivity } from "../logic/actions";
import { startGameLoop } from "../logic/controller";
import { debugLog } from "../utils/debugLog";
import { State } from "../types/types";
import StatusOverview from "./StatusOverview";
import MenuOverlay from "./MenuOverlay";
import { addActivityToHistory } from "../logic/activityHistory";
import { effectIcons } from "../utils/effectIcons";

const MainScene = () => {
  // 🎮 Spielzustand
  const [state, setState] = useState<State | null>(null);

  // 🧪 Dev Tools (z. B. später Cheat-Menü)
  const [showCheats] = useState(false);

  // 📋 Menüsteuerung
  const [showMenu, setShowMenu] = useState(false);

  // ⏳ Fortschrittswert der Tick-Animation (0–100)
  const [tickProgress, setTickProgress] = useState(0);

  /**
   * ⏱ Initiales Laden des Blobbi-Zustands beim Start der App.
   * Öffnet Menü, wenn Name noch nicht vergeben wurde.
   */
  useEffect(() => {
    loadBlobbiState().then((loadedState) => {
      setState(loadedState);
      if (
        loadedState.name === "{blobbiName}" ||
        loadedState.name.trim().length === 0
      ) {
        setShowMenu(true);
      }
    });
  }, []);

  /**
   * 🧠 Setzt den Seitentitel im Browser (Tab) abhängig vom aktuellen Emoji + Name
   */
  useEffect(() => {
    if (state?.name && state?.currentEmoji) {
      document.title = `${state.currentEmoji} ${state.name} lebt!`;
    } else { 
      document.title = "Blobbi-Gotchi";
    }
  }, [state?.name, state?.currentEmoji]);

  /**
   * 🔁 Startet den GameLoop (Tick-Mechanik).
   * Nutzt einen typensicheren Wrapper für setState, da der State auch null sein kann.
   */
  useEffect(() => {
    if (!state) return;

    const safeSetState: React.Dispatch<React.SetStateAction<State>> = (fnOrValue) =>
      setState((prev) => {
        if (!prev) return prev as unknown as State;
        const result =
          typeof fnOrValue === "function"
            ? (fnOrValue as (prev: State) => State)(prev)
            : fnOrValue;
        return result;
      });

    const interval = startGameLoop(state, safeSetState);
    return () => clearInterval(interval);
  }, [state?.settings?.timeFactor]);


  /**
   * ⏳ Fortschrittsanimation: zeigt die verbleibenden "BlobbiSeconds" bis zur nächsten Blobbi-Minute.
   * Sie basiert ausschließlich auf der Tick-Dauer, die aus dem timeFactor berechnet wird.
   */
  useEffect(() => {
    if (!state?.settings?.timeFactor) return;

    //const tickDurationMs = 60_000 / state.settings.timeFactor;
    const interval = setInterval(() => {
      const now = new Date();
      const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
      const progress = (seconds % (60 / state.settings.timeFactor)) / (60 / state.settings.timeFactor);
      setTickProgress(progress * 100);
    }, 100); // Aktualisiere 10× pro Sekunde

    return () => clearInterval(interval);
  }, [state?.settings?.timeFactor]);



  /**
   * 🎯 Führt eine zufällige Aktivität aus der gewählten Kategorie aus.
   * Wird durch Button-Klicks unten ausgelöst.
   */
  const triggerRandomActivity = (category: string) => {
    debugLog(state?.settings, "triggerRandomActivity", category);

    const result = startActivity(category, state!);
    if (!result) return;

    const { newState, activityEmoji, activityTitle, activityEffects } = result;

    const effects = Object.entries(activityEffects).map(([key, value]) => ({
      icon: effectIcons[key] ?? "❓",
      value
    }));

    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

    if (state?.settings) {
      addActivityToHistory(
        {
          timestamp: timeString,
          emoji: activityEmoji,
          title: activityTitle,
          effects
        },
        state.settings
      );
    }

    setState(newState);
  };

  if (!state)
    return <div className="text-center p-4">Lade Blobbi...</div>;

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-b from-blue-100 to-blue-300">
      {/* 🔝 Oberer Statusbereich */}
      <div className="flex flex-col gap-1 text-sm mb-4 px-4">
        <StatusOverview state={state} />
      </div>

      {/* 🧍 Avatar + Aktivitätsanzeige */}
      <div className="w-full flex flex-col items-center justify-center flex-grow">
        <div className="relative flex items-center justify-center mb-2">
          <div className="text-9xl emoji-state">{state.currentEmoji}</div>
          {state.activityEmoji && (
            <div className="absolute bottom-1 right-1 w-14 h-14 rounded-full bg-black flex items-center justify-center">
              <span className="text-3xl emoji-activity">
                {state.activityEmoji}
              </span>
            </div>
          )}
        </div>
        <div className="h-4" />
        <div className="text-lg font-bold text-center">
          {state.currentActivity ?? "?"}
        </div>
        {state.currentActivityDescription && (
          <div className="italic text-gray-700 text-center mt-1">
            {state.currentActivityDescription}
          </div>
        )}
      </div>

      {/* ⏳ Fortschrittsbalken + Button-Menü */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Fortschrittsbalken */}
        <div className="h-1 bg-gray-200 w-full">
          <div
            className="h-full bg-black transition-all duration-100 ease-linear"
            style={{ width: `${tickProgress}%` }}
          />
        </div>

        {/* Aktions-Buttons */}
        <div className="bg-white border-t p-3 flex justify-around">
          <button
            onClick={() => triggerRandomActivity("food")}
            className="text-3xl p-2 bg-green-400 rounded-full"
          >
            🍔
          </button>
          <button
            onClick={() => triggerRandomActivity("hygiene")}
            className="text-3xl p-2 bg-blue-400 rounded-full"
          >
            🧼
          </button>
          <button
            onClick={() => triggerRandomActivity("entertainment")}
            className="text-3xl p-2 bg-purple-400 rounded-full"
          >
            🎮
          </button>
          <button onClick={() => setShowMenu(true)} className="text-3xl p-2">
            ☰
          </button>
        </div>
      </div>

      {/* 🧪 Optionales Cheat-Menü */}
      {showCheats && (
        <div className="absolute top-16 right-4 bg-white shadow-xl rounded p-4 text-sm">
          <div>Cheat-Menü (bald verfügbar 😉)</div>
        </div>
      )}

      {/* 📋 Einstellungsmenü */}
      {showMenu && state && (
        <MenuOverlay
          state={state}
          setState={setState as React.Dispatch<React.SetStateAction<State>>}
          onClose={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default MainScene;
