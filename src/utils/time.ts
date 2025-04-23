// src/utils/time.ts

import { State } from "../types/types";

/**
 * Gibt die aktuelle Blobbi-Zeit als Stunden, Minuten und Sekunden zurück.
 * 
 * - Wenn timeFactor === 1: Systemzeit wird direkt verwendet (realtime mode)
 * - Wenn timeFactor > 1: Zeit wird intern berechnet (virtuelle Spielzeit)
 * 
 * Diese Funktion sorgt dafür, dass Anzeige und Logik synchron laufen –
 * unabhängig vom gewählten Zeitskalierungsfaktor.
 */
export function getBlobbiClock(state: State): {
  hh: number;
  mm: number;
  ss: number;
} {
  const now = Date.now();

  // 🕒 Realtime-Modus → benutze direkt die Systemzeit
  if (state.settings.timeFactor === 1) {
    const date = new Date(now);
    return {
      hh: date.getHours(),
      mm: date.getMinutes(),
      ss: date.getSeconds(),
    };
  }

  // 🎮 Spielzeit-Modus (timeFactor > 1) → simuliere die Zeit intern
  const elapsedRealMs = now - state.blobbiClockStartTimestamp;
  const blobbiMinutesPassed = (elapsedRealMs / 1000 / 60) * state.settings.timeFactor;
  const totalBlobbiMinutes = state.blobbiClockMinutes + blobbiMinutesPassed;

  const totalSeconds = Math.floor(totalBlobbiMinutes * 60);
  return {
    hh: Math.floor(totalSeconds / 3600) % 24,
    mm: Math.floor((totalSeconds % 3600) / 60),
    ss: totalSeconds % 60,
  };
}
