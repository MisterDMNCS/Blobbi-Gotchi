import React from "react";
import { State } from "../types/types";

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
            ⏳ {state.ageInHours}h{" "}
            <span className="text-xs text-gray-500">
              ({state.settings?.timeFactor ?? 1}×)
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StatusOverview;
