import { create } from "zustand";

/**
 * The "Smart Watch Connection" / Device Sync flow is a scripted, local-only demo
 * — the same posture as the speaker pairing flow in `features/devices/`. Nothing
 * is persisted to the backend; the discovered-device list lives entirely here.
 * No real BLE, no radio: linking is a state transition, signal strength is a
 * seeded label.
 */

export type Signal = "strong" | "weak";

/**
 * - `linked`    — connected; chain icon, highlighted row.
 * - `linkable`  — found and pairable; tap to start syncing.
 * - `syncing`   — pairing in progress; `progress` drives the bar 0→100.
 * - `disabled`  — out of range / incompatible (Echo Point); broken-chain, greyed.
 */
export type WatchStatus = "linked" | "linkable" | "syncing" | "disabled";

export type Watch = {
  id: string;
  name: string;
  signal: Signal;
  status: WatchStatus;
  /** 0–100 while `syncing`; ignored otherwise. */
  progress: number;
  /** Echo Point is a speaker, drawn with its product image instead of a watch glyph. */
  kind: "watch" | "speaker";
};

function makeId(): string {
  return `watch_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

const SEED: Watch[] = [
  { id: "watch-jake", name: "Jake Smartwatch", signal: "strong", status: "linked", progress: 100, kind: "watch" },
  { id: "watch-echo", name: "Echo Point", signal: "weak", status: "disabled", progress: 0, kind: "speaker" },
];

type WatchState = {
  watches: Watch[];
  addWatch: (input: Omit<Watch, "id"> & { id?: string }) => string;
  updateWatch: (id: string, patch: Partial<Watch>) => void;
  removeWatch: (id: string) => void;
  hasWatch: (name: string) => boolean;
};

export const useWatchStore = create<WatchState>((set, get) => ({
  watches: SEED,

  addWatch: ({ id, ...rest }) => {
    const newId = id ?? makeId();
    set((s) => ({ watches: [{ id: newId, ...rest }, ...s.watches] }));
    return newId;
  },

  updateWatch: (id, patch) =>
    set((s) => ({ watches: s.watches.map((w) => (w.id === id ? { ...w, ...patch } : w)) })),

  removeWatch: (id) => set((s) => ({ watches: s.watches.filter((w) => w.id !== id) })),

  hasWatch: (name) => get().watches.some((w) => w.name === name),
}));
