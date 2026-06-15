import { create } from "zustand";
import type { DeviceType } from "./catalog";
import { outcomeForAttempt, type PairResult } from "./simulatePairing";

/**
 * A locally-paired speaker. The shape mirrors the API's device fields so the
 * rest of the app stays shape-compatible, but in this demo nothing is persisted
 * to the backend — the list lives entirely in this store. The "simulated"
 * fields (`batteryLevel`, `firmwareVersion`, `isConnected`) are seeded once at
 * add time and never updated, exactly as the real backend would treat them.
 */
export type DemoDevice = {
  id: string;
  name: string;
  deviceType: DeviceType;
  batteryLevel: number;
  firmwareVersion: string;
  isConnected: boolean;
  createdAt: string;
};

const SEED_FIRMWARE = "1.4.2";

/** Client-only id for React keys / store lookups. Not a security identifier. */
function makeId(): string {
  return `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Pseudo-random battery level, 20–100, seeded once like the real backend. */
function seedBattery(): number {
  return Math.floor(Math.random() * 81) + 20;
}

type DevicesState = {
  devices: DemoDevice[];
  /** Per-device power state. Frontend-only demo interaction; defaults to ON. */
  powered: Record<string, boolean>;
  /** Demo script cursor — which pairing attempt we're on. */
  attempt: number;

  addDevice: (input: { name: string; deviceType: DeviceType }) => DemoDevice;
  removeDevice: (id: string) => void;
  togglePower: (id: string) => void;
  /** Returns the scripted outcome for the current attempt and advances the cursor. */
  recordAttempt: () => PairResult;
};

export const useDevicesStore = create<DevicesState>((set, get) => ({
  devices: [],
  powered: {},
  attempt: 0,

  addDevice: ({ name, deviceType }) => {
    const device: DemoDevice = {
      id: makeId(),
      name,
      deviceType,
      batteryLevel: seedBattery(),
      firmwareVersion: SEED_FIRMWARE,
      isConnected: true,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({
      devices: [...s.devices, device],
      powered: { ...s.powered, [device.id]: true },
    }));
    return device;
  },

  removeDevice: (id) =>
    set((s) => {
      const { [id]: _removed, ...powered } = s.powered;
      return { devices: s.devices.filter((d) => d.id !== id), powered };
    }),

  togglePower: (id) =>
    set((s) => ({ powered: { ...s.powered, [id]: !(s.powered[id] ?? true) } })),

  recordAttempt: () => {
    const outcome = outcomeForAttempt(get().attempt);
    set((s) => ({ attempt: s.attempt + 1 }));
    return outcome;
  },
}));

/** Power state + toggle for a single device. Defaults to ON when first seen. */
export function useDevicePower(deviceId: string) {
  const powered = useDevicesStore((s) => s.powered[deviceId] ?? true);
  const toggle = useDevicesStore((s) => s.togglePower);
  return { powered, toggle: () => toggle(deviceId) };
}
