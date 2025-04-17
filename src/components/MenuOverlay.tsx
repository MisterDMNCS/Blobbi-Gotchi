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
                value={state.name}
                onChange={(e) =>
                  setState({ ...state, name: e.target.value })
                }
                className="flex-grow px-3 py-2 border border-gray-300 rounded"
              />
              <button
                onClick={() => {
                  // Optional: persist name
                }}
                className="bg-purple-500 text-white px-4 py-2 rounded"
              >
                Speichern
              </button>
            </div>
          </div>

          {/* Speed control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spielgeschwindigkeit ({state.settings?.gameSpeed}ms)
            </label>
            <div className="flex gap-2">
              <select
                className="flex-grow border px-3 py-2 rounded"
                value={state.settings?.gameSpeed ?? 1000}
                onChange={(e) =>
                  setState({
                    ...state,
                    settings: {
                      ...state.settings,
                      gameSpeed: parseInt(e.target.value),
                    },
                  })
                }
              >
                <option value={2000}>Langsam</option>
                <option value={1000}>Normal</option>
                <option value={500}>Schnell</option>
              </select>
              <button
                onClick={() => {
                  // Optional: persist speed
                }}
                className="bg-purple-500 text-white px-4 py-2 rounded"
              >
                Speichern
              </button>
            </div>
          </div>

          {/* Reset button */}
          <div>
            <button className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600">
              Spiel zurücksetzen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuOverlay;
