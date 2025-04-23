/**
 * MenuOverlay.tsx
 * -----------------------------
 * Das Menü-Overlay zeigt den Status, den Aktivitätsverlauf und Einstellungen.
 * Es erlaubt dem Benutzer, den Blobbi umzubenennen, die Spielgeschwindigkeit zu ändern
 * oder das Spiel komplett zurückzusetzen.
 */

import React, { useEffect, useState, useRef } from "react";
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
  const nameInputRef = useRef<HTMLInputElement>(null);

  /**
   * 🎯 Fokussiere und markiere das Namensfeld,
   * wenn der Benutzername noch nicht gesetzt ist.
   */
  useEffect(() => {
    if (
      state.name === "{blobbiName}" ||
      state.name.trim().length === 0
    ) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, []);

  /**
   * 🔄 Lade regelmäßig die Aktivitätshistorie aus localStorage.
   * Dies ermöglicht eine Live-Aktualisierung auch bei automatischen Aktivitäten.
   */
  useEffect(() => {
    // ⏱ Sofort laden
    setHistory(loadActivityHistory());
  
    // 🔄 Danach regelmäßig aktualisieren
    const interval = setInterval(() => {
      setHistory(loadActivityHistory());
    }, 1000);
  
    return () => clearInterval(interval);
  }, []);
  


  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="p-6 max-w-xl mx-auto">
        {/* 🔝 Statusübersicht */}
        <div className="mb-4">
          <StatusOverview state={state} />
        </div>

        {/* 📜 Verlauf der letzten Aktivitäten */}
        <div className="mb-6 max-h-64 overflow-y-auto border rounded shadow-inner bg-white">
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

        {/* 🛠️ Einstellungsbereich */}
        <div className="space-y-6">
          {/* Namensänderung */}
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
                    window.location.reload(); // 🔄 Nach dem Speichern alles neu laden
                  });
                }}
                className="bg-purple-500 text-white px-4 py-2 rounded"
              >
                Speichern
              </button>
            </div>
          </div>

          {/* Spielgeschwindigkeit (Option Boxes) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spielgeschwindigkeit:{" "}
              <span className="font-bold">{state.settings?.timeFactor}×</span>
            </label>
            <div className="flex gap-2 flex-wrap mt-1">
              {[1, 10, 30, 60].map((factor) => (
                <label
                  key={factor}
                  className={`px-3 py-1 rounded border cursor-pointer text-sm transition
                    ${
                      state.settings?.timeFactor === factor
                        ? "bg-purple-500 text-white border-purple-500"
                        : "bg-white text-gray-800 border-gray-300 hover:border-purple-400"
                    }`}
                >
                  <input
                    type="radio"
                    name="speed"
                    value={factor}
                    checked={state.settings?.timeFactor === factor}
                    onChange={() => {
                      setState((prev) => {
                        const updated = { ...prev };
                        if (updated.settings) {
                          updated.settings.timeFactor = factor;
                        }
                        return updated;
                      });
                    }}
                    className="hidden"
                  />
                  {factor}×
                </label>
              ))}
              {/* Uhrzeit zurücksetzen */}
              <button
                onClick={() => {
                  const now = new Date();
                  const minutes = now.getHours() * 60 + now.getMinutes(); + now.getSeconds() / 60;
                  
                  const updated = {
                    ...state,
                    settings: { ...state.settings, timeFactor: 1 },
                    blobbiClockMinutes: minutes
                  };
                  setState(updated);
                  import("../logic/storage").then(({ saveState }) => saveState(updated));
                }}
                className="px-3 py-1 rounded border bg-red-100 text-red-800 hover:bg-red-200 text-sm"
              >
                Reset Time
              </button>
            </div>
          </div>

          {/* Reset-Link */}
          <div className="text mt-2">
            <button
              onClick={() => {
                const confirmed = window.confirm(
                  "Willst du wirklich das Spiel zurücksetzen?\nAlle Daten und der Verlauf werden dauerhaft gelöscht."
                );
                if (!confirmed) return;
                localStorage.clear();
                window.location.reload();
              }}
              className="text-sm text-red-600 hover:text-red-800 underline underline-offset-2 transition"
            >
              Neuen Blobbi starten (alle Daten löschen)
            </button>
          </div>
         
        </div>

        

        {/* Schließen-Button unten rechts */}
        <div className="fixed bottom-3 right-6 z-50">
          <button
            onClick={() => {
              const updated = { ...state, name: nameInput };
              setState(updated);
              import("../logic/storage").then(({ saveState }) => {
                saveState(updated);
                onClose();
              });
            }}
            className="text-5xl p-2 transition"
            aria-label="Menü schließen"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuOverlay;
