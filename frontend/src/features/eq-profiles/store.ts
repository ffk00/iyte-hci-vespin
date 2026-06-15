import { create } from "zustand";
import { flatBands } from "./bands";
import type { EqIconName } from "./modeIcons";

/**
 * A locally-stored EQ profile for the demo. The shape echoes the API's
 * `EQProfile` (id, name, isSystem, bands, createdAt) but is intentionally a
 * 10-band, client-only model — nothing here is persisted to the backend, the
 * same way the device-pairing flow is local-only. Factory presets are the
 * read-only "system" profiles; personal tones are user-created.
 */
export type EqProfile = {
  id: string;
  name: string;
  isSystem: boolean;
  /** Glyph shown on cards, tiles and the editor button. */
  icon: EqIconName;
  /** Short tagline shown under factory presets (e.g. "Deep low-end"). */
  subtitle?: string;
  /** 10 gain values in dB, one per band (see bands.ts). */
  bands: number[];
  createdAt: string;
  /** When the profile was last applied; null for never-used presets. */
  lastUsedAt: string | null;
};

const now = () => new Date().toISOString();
const daysAgo = (n: number) =>
  new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

/** Client-only id for React keys / store lookups. Not a security identifier. */
function makeId(): string {
  return `eq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const FACTORY: EqProfile[] = [
  {
    id: "factory-balanced",
    name: "Balanced",
    isSystem: true,
    icon: "balanced",
    subtitle: "Standard profile",
    bands: flatBands(),
    createdAt: daysAgo(120),
    lastUsedAt: null,
  },
  {
    id: "factory-bass-boost",
    name: "Bass Boost",
    isSystem: true,
    icon: "bassBoost",
    subtitle: "Deep low-end",
    bands: [8, 7, 5, 3, 1, 0, 0, 0, 1, 2],
    createdAt: daysAgo(120),
    lastUsedAt: daysAgo(1),
  },
  {
    id: "factory-studio",
    name: "Studio",
    isSystem: true,
    icon: "studio",
    subtitle: "Flat response",
    bands: flatBands(),
    createdAt: daysAgo(120),
    lastUsedAt: null,
  },
  {
    id: "factory-bright",
    name: "Bright",
    isSystem: true,
    icon: "bright",
    subtitle: "Clarity & Air",
    bands: [-1, -1, 0, 0, 1, 2, 4, 5, 6, 7],
    createdAt: daysAgo(120),
    lastUsedAt: null,
  },
];

const PERSONAL: EqProfile[] = [
  {
    id: "tone-night",
    name: "Night Listen",
    isSystem: false,
    icon: "moon",
    bands: [3, 2, 1, 0, 0, -1, -2, -3, -4, -5],
    createdAt: daysAgo(10),
    lastUsedAt: daysAgo(1),
  },
  {
    id: "tone-gym",
    name: "Gym Pump",
    isSystem: false,
    icon: "dumbbell",
    bands: [9, 8, 4, 1, 0, 2, 3, 5, 6, 4],
    createdAt: daysAgo(20),
    lastUsedAt: daysAgo(4),
  },
];

type EqState = {
  profiles: EqProfile[];
  /** The currently-applied profile (the one marked ACTIVE). */
  activeId: string;

  create: (input: { name: string; icon: EqIconName; bands: number[] }) => EqProfile;
  update: (
    id: string,
    patch: Partial<Pick<EqProfile, "name" | "icon" | "bands">>,
  ) => void;
  remove: (id: string) => void;
  /** Apply a profile (mark active) and stamp its last-used time. */
  apply: (id: string) => void;
};

export const useEqStore = create<EqState>((set) => ({
  profiles: [...FACTORY, ...PERSONAL],
  activeId: "factory-bass-boost",

  create: ({ name, icon, bands }) => {
    const profile: EqProfile = {
      id: makeId(),
      name,
      isSystem: false,
      icon,
      bands,
      createdAt: now(),
      lastUsedAt: now(),
    };
    // Newest personal tones surface at the top of the list.
    set((s) => ({ profiles: [profile, ...s.profiles] }));
    return profile;
  },

  update: (id, patch) =>
    set((s) => ({
      profiles: s.profiles.map((p) =>
        p.id === id ? { ...p, ...patch, lastUsedAt: now() } : p,
      ),
    })),

  remove: (id) =>
    set((s) => ({ profiles: s.profiles.filter((p) => p.id !== id) })),

  apply: (id) =>
    set((s) => ({
      activeId: id,
      profiles: s.profiles.map((p) =>
        p.id === id ? { ...p, lastUsedAt: now() } : p,
      ),
    })),
}));

export function useEqProfile(id: string | undefined): EqProfile | undefined {
  return useEqStore((s) => s.profiles.find((p) => p.id === id));
}
