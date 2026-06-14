import { useMemo } from "react";
import { useDevicesStore, type DemoDevice } from "../store";

/**
 * The current paired devices, newest first. There is no API in this demo — the
 * list comes straight from the local store — but this selector hook keeps
 * components decoupled from the store shape (and the ordering rule in one
 * place), mirroring the domain-hook convention used elsewhere.
 *
 * The store selector returns the stable `devices` array (sorting inside it would
 * produce a new reference every render and loop `useSyncExternalStore`); the
 * newest-first ordering is applied here in a `useMemo`.
 */
export function useDevices(): DemoDevice[] {
  const devices = useDevicesStore((s) => s.devices);
  return useMemo(
    () => [...devices].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [devices],
  );
}
