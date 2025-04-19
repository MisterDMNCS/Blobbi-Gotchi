import { State, ActivityHistoryEntry } from "../types/types";
import StatusOverview from "./StatusOverview";
import { loadActivityHistory } from "../logic/activityHistory";
import React, { useEffect, useState, useRef } from "react";

interface Props {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
  onClose: () => void;
}

const MenuOverlay: React.FC<Props> = ({ state, setState, onClose }) => {
  const [history, setHistory] = useState<ActivityHistoryEntry[]>([]);
  const [nameInput, setNameInput] = useState(state.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (
      state.name === "{blobbiName}" ||
      state.name.trim().length === 0
    ) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const data = loadActivityHistory();
      setHistory(data);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const persistNameChange = (newName: string) => {
    const updated = { ...state, name: newName };
    setState(updated);
    import("../logic/storage").then(({ saveState }) => {
      saveState(updated);
    });
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
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
                        {entry.effects.length === 0 ? (
                          <span className="italic text-gray-400">(keine Auswirkung)</span>
                        ) : (
                          entry.effects.map((eff, i) => (
                            <span
                              key={i}
                              className="inline-block mr-2 whitespace-nowrap"
                            >
                              {eff.icon} {eff.value > 0 ? "+" : ""}
                              {eff.value}
                            </span>
                          ))
                        )}
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
            <label htmlFor="nameInput" className="block text-sm font-medium text-gray-700 mb-1">
              Name ändern
            </label>
            <div className="flex gap-2">
              <input
                id="nameInput"
                ref={nameInputRef}
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded"
              />
              <button
                onClick={() => {
                  const updated = { ...state, name: nameInput };
                  setState(updated);
                  import("../logic/storage").then(({ saveState }) => {
                    saveState(updated);
                    window.location.reload(); // ✅ direkter Reload nach Speichern
                  });
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
                const confirmed = window.confirm(
                  "Willst du wirklich das Spiel zurücksetzen?\nAlle Daten und der Verlauf werden dauerhaft gelöscht."
                );
                if (!confirmed) return;
                localStorage.clear();
                window.location.reload();
              }}
            >
              Spiel zurücksetzen
            </button>
          </div>
        </div>

        {/* ❌ Close button unten rechts (ersetzt Burger-Button) */}
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => {
              if (nameInput !== state.name) {
                persistNameChange(nameInput);
              }
              onClose();
            }}
            className="text-3xl p-2 bg-white rounded-full shadow-lg border hover:bg-gray-100 transition"
            aria-label="Menü schließen"
          >
            ❌
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuOverlay;
