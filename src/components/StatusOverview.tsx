import React from "react";
import { State } from "../types/types";


function getBlobbiClockHHMMSS(state: State): string {
  const now = Date.now();

  if (!state.blobbiClockStartTimestamp || !state.settings?.timeFactor) {
    return "00:00:00";
  }

  const elapsedRealMs = now - state.blobbiClockStartTimestamp;
  const blobbiMinutesPassed = (elapsedRealMs / 1000 / 60) * state.settings.timeFactor;
  const totalBlobbiMinutes = state.blobbiClockMinutes + blobbiMinutesPassed;

  const totalSeconds = Math.floor(totalBlobbiMinutes * 60);
  const h = Math.floor(totalSeconds / 3600) % 24;
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

interface Props {
  state: State;
}

const StatusOverview: React.FC<Props> = ({ state }) => {
  return (
    <div className="text-sm font-semibold">
      <div className="text-xl font-bold mb-1">{state.name}</div>
      <div className="flex flex-col gap-y-1">
        <div className="flex gap-x-4">
          <div>🍔 {state.hunger}%</div>
          <div>⚡ {state.energy}%</div>
          <div>😄 {state.mood}%</div>
          <div>🛁 {state.hygiene}%</div>
        </div>
        <div className="flex gap-x-4">
          <div>⭐ Lv {state.level}</div>
          <div>📈 XP: {state.xp}</div>
          <div>
            🕒 {getBlobbiClockHHMMSS(state) }
            <span className="text-xs text-gray-500">
              ({state.settings?.timeFactor ?? 1}×)
            </span>
          </div>
          <div>
            📆 Tag {state.blobbiDays}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusOverview;
