import React, { useEffect, useState } from "react";
import { State, ActivityHistoryEntry } from "../types/types";
import StatusOverview from "./StatusOverview";
import { loadActivityHistory } from "../logic/activityHistory";

interface Props {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
  onClose: () => void;
}

const MenuOverlay: React.FC<Props> = ({ state, setState, onClose }) => {
  const [history, setHistory] = useState<ActivityHistoryEntry[]>([]);
  const [nameInput, setNameInput] = useState(state.name);

  useEffect(() => {
    setHistory(loadActivityHistory());
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* ❌ Close icon (fixed) */}
      <div className="fixed top-3 right-3 z-50">
        <button
          onClick={onClose}
          className="text-3xl p-2"
          aria-label="Menü schließen"
        >
          ❌
        </button>
      </div>

      <div className="p-6 max-w-xl mx-auto">
        {/* 🔝 Status overview */}
        <div className="mb-4">
          <StatusOverview state={state} />
        </div>

        {/* 📜 Activity History */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Letzte Aktivitäten</h3>

          {history.length === 0 ? (
            <div className="text-sm text-gray-500">
              Noch keine Aktivitäten gespeichert.
            </div>
          ) : (
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2">🕒</th>
                  <th className="text-left p-2">Aktivität</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2 align-top text-nowrap">{entry.timestamp}</td>
                    <td className="p-2 align-top">
                      <div>{entry.emoji} {entry.title}</div>
                      <div className="mt-1 text-gray-600 text-xs">
                        {entry.effects.map((eff, i) => (
                          <span
                            key={i}
                            className="inline-block mr-2 whitespace-nowrap"
                          >
                            {eff.icon} {eff.value > 0 ? "+" : ""}
                            {eff.value}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 🛠️ Options Menu */}
        <div className="space-y-6">
          {/* Rename */}
          <div>
            <label
              htmlFor="nameInput"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name ändern
            </label>
            <div className="flex gap-2">
              <input
                id="nameInput"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded"
              />
              <button
                onClick={() => {
                  setState({ ...state, name: nameInput });
                }}
                className="bg-purple-500 text-white px-4 py-2 rounded"
              >
                Speichern
              </button>
            </div>
          </div>

          {/* Time factor control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spielgeschwindigkeit (Faktor):{" "}
              <span className="font-bold">{state.settings?.timeFactor ?? 1}×</span>
            </label>
            <input
              type="range"
              min={1}
              max={60}
              step={1}
              value={state.settings?.timeFactor ?? 1}
              onChange={(e) => {
                const newFactor = parseInt(e.target.value);
                setState((prev) => {
                  const updated = { ...prev };
                  if (!updated.settings) return prev;
                  updated.settings.timeFactor = newFactor;
                  return updated;
                });
              }}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
              <span>1×</span>
              <span>60×</span>
            </div>
          </div>

          {/* Reset button */}
          <div>
            <button
              className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
              onClick={() => {
                localStorage.clear(); // Lösche den lokalen Speicher

                // Lade den Ursprungszustand neu
                import("../state/loadState").then(({ loadBlobbiState }) => {
                  loadBlobbiState().then((freshState) => {
                    setState(freshState);
                    onClose();
                  });
                });
              }}
            >
              Spiel zurücksetzen
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MenuOverlay;
