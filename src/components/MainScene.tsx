import { useEffect, useState } from "react";
import { loadBlobbiState } from "../state/loadState";
import { startActivity } from "../logic/actions";
import { startGameLoop } from "../logic/controller";
import { debugLog } from "../utils/debugLog";
import { State } from "../types/types";

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
    if (updatedState) setState(updatedState);
  };

  if (!state) return <div className="text-center p-4">Lade Blobbi...</div>;

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-b from-blue-100 to-blue-300">
      {/* 🔝 Top bar */}
      <div className="flex flex-col gap-1 text-sm mb-4 px-4">
        <div className="text-xl font-bold">{state.name}</div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 font-semibold">
          <div>🍔 {state.hunger}%</div>
          <div>⚡ {state.energy}%</div>
          <div>😄 {state.mood}%</div>
          <div>🛁 {state.hygiene}%</div>
          <div>⭐ Lv {state.level}</div>
          <div>📈 XP: {state.xp}</div>
          <div>⏳ {state.ageInHours}h</div>
        </div>
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
        <button
          onClick={() => setShowMenu(true)}
          className="text-3xl p-2 bg-gray-400 rounded-full"
        >
          ☰
        </button>
      </div>

      {/* 🔧 Cheat menu */}
      {showCheats && (
        <div className="absolute top-16 right-4 bg-white shadow-xl rounded p-4 text-sm">
          <div>Cheat-Menü (bald verfügbar 😉)</div>
        </div>
      )}

      {/* 📋 Mockup menu */}
      {showMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">🛠️ Menü</h2>

            <div className="mb-4">
              <label
                htmlFor="nameInput"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name ändern
              </label>
              <input
                id="nameInput"
                type="text"
                value={state.name}
                onChange={(e) => setState({ ...state, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <button
              onClick={() => setShowMenu(false)}
              className="mt-4 px-4 py-2 bg-purple-500 text-white rounded"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainScene;
