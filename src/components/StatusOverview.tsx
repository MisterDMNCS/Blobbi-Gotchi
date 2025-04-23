import React from "react";
import { State } from "../types/types";
import { getBlobbiClock } from "../utils/time"; // Zeitlogik für HH:MM:SS

interface Props {
  state: State;
}

const StatusOverview: React.FC<Props> = ({ state }) => {
  const clock = getBlobbiClock(state);
  const hh = clock.hh.toString().padStart(2, "0");
  const mm = clock.mm.toString().padStart(2, "0");
  const ss = clock.ss.toString().padStart(2, "0");

  return (
    <div className="text-sm font-semibold">
      {/* 🔠 Zeile 1: Name */}
      <div className="text-xl font-bold mb-1">{state.name}</div>

      {/* 🟦 Zeile 2: Fortschritt (Level, XP, Zeit, Tag) */}
      <div className="flex gap-x-4">
        <div>⭐ Lv {state.level}</div>
        <div>📈 XP: {state.xp}</div>
        <div>🕒 {hh}:{mm}:{ss} Uhr</div>
        <div>📆 Tag {state.blobbiDays}</div>
      </div>

      {/* 🟨 Zeile 3: Statuswerte */}
      <div className="flex gap-x-4 mt-1">
        <div>🍔 {state.hunger}%</div>
        <div>⚡ {state.energy}%</div>
        <div>😄 {state.mood}%</div>
        <div>🛁 {state.hygiene}%</div>
      </div>

      {/* ⏩ Zeile 4: TimeFactor (nur sichtbar wenn >1) */}
      {state.settings?.timeFactor && state.settings.timeFactor > 1 && (
        <div className="flex items-center gap-x-2 text-xs text-gray-600 mt-1">
          <span>⏩</span>
          <span>Zeitraffer: {state.settings.timeFactor}×</span>
        </div>
      )}
    </div>
  );
};

export default StatusOverview;
