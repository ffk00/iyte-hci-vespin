/**
 * EQ band model for the UI mock. The reference design exposes a 10-band
 * graphic equalizer; the backend's real `EQBands` schema only has 5 bands, so
 * this 10-band shape lives entirely on the client (see the local store). The
 * dB range matches the backend's per-band limits.
 */

export const BAND_LABELS = [
  "32",
  "64",
  "125",
  "250",
  "500",
  "1k",
  "2k",
  "4k",
  "8k",
  "16k",
] as const;

export const BAND_COUNT = BAND_LABELS.length;

export const DB_MIN = -12;
export const DB_MAX = 12;

/** A flat (all-zero) curve — the neutral default. */
export function flatBands(): number[] {
  return new Array(BAND_COUNT).fill(0);
}

/** Clamp a dB value into the allowed range and round to a whole dB step. */
export function clampDb(value: number): number {
  return Math.max(DB_MIN, Math.min(DB_MAX, Math.round(value)));
}
