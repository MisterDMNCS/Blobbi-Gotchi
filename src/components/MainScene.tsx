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
  const [state, setState] = useState<State | null>(null);
  const [showCheats] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    loadBlobbiState().then(setState);
  }, []);

  useEffect(() => {
    if (!state) return;
    const interval = startGameLoop(state, setState);
    return () => clearInterval(interval);
  }, [state?.gameSpeed]);

  const triggerRandomActivity = (category: string) => {
    debugLog(state?.settings, "triggerRandomActivity", category);
    const updatedState = startActivity(category, state!);
    if (!updatedState) return;
  
    // Extract last activity info from updatedState
    const { lastActivityEmoji, lastActivityTitle, lastActivityEffects } = updatedState;
  
    // Skip if data missing
    if (!lastActivityEmoji || !lastActivityTitle || !lastActivityEffects) return;
  
    // Build effects array for history
    const effects = Object.entries(lastActivityEffects).map(([key, value]) => ({
      icon: effectIcons[key] ?? "❓",
      value
    }));
  
    // Timestamp
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  
    // Save to history
    addActivityToHistory(
      {
        timestamp: timeString,
        emoji: lastActivityEmoji,
        title: lastActivityTitle,
        effects
      },
      state.settings
    );
    
  
    setState(updatedState);
  };
  

  if (!state) return <div className="text-center p-4">Lade Blobbi...</div>;

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-b from-blue-100 to-blue-300">
      {/* 🔝 Top bar */}
      <div className="flex flex-col gap-1 text-sm mb-4 px-4">
        <StatusOverview state={state} />
      </div>

      {/* 🧍 Avatar */}
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
        <div className="h-4" /> {/* 🆕 Freiraum zwischen Emoji und Titel */}
        {/* Title & description */}
        <div className="text-lg font-bold text-center">
          {state.currentActivity ?? "?"}
        </div>
        {state.currentActivityDescription && (
          <div className="italic text-gray-700 text-center mt-1">
            {state.currentActivityDescription}
          </div>
        )}
      </div>

      {/* 🔘 Bottom menu */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-around z-50">
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

      {/* 🔧 Cheat menu */}
      {showCheats && (
        <div className="absolute top-16 right-4 bg-white shadow-xl rounded p-4 text-sm">
          <div>Cheat-Menü (bald verfügbar 😉)</div>
        </div>
      )}

      {/* 📋 Expanded menu */}
      {showMenu && (
        <MenuOverlay state={state} setState={setState} onClose={() => setShowMenu(false)} />
      )}
    </div>
  );
};

export default MainScene;
