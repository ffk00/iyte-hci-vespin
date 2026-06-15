import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/colors";
import { SettingsScreen } from "@/features/settings/components/SettingsScreen";
import { useWatchStore, type Watch } from "../store";
import { WatchIcon } from "../watchIcon";
import { DotsSpinner } from "./DotsSpinner";
import { WatchRow } from "./WatchRow";

const CIRCLE_SIZE = 120;
const SEARCH_MS = 1800; // scan duration before a device is "found"
const STEP_MS = 110; // sync-progress tick
const STEP = 6; // progress added per tick

/**
 * The "Smart Watch Connection" screen. A scripted, local-only demo (no real
 * BLE): tapping the circle runs a fake scan that discovers "Dora Smartwatch",
 * which then syncs to 100% and becomes linked. Rows can be linked/unlinked and
 * swiped to delete. See `features/devices/` for the same posture.
 */
export function DeviceSync() {
  const watches = useWatchStore((s) => s.watches);
  const addWatch = useWatchStore((s) => s.addWatch);
  const updateWatch = useWatchStore((s) => s.updateWatch);
  const removeWatch = useWatchStore((s) => s.removeWatch);
  const hasWatch = useWatchStore((s) => s.hasWatch);

  const [searching, setSearching] = useState(false);

  // Track every timer so an unmount mid-scan/sync can't fire a setState later.
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const runSync = (id: string) => {
    const tick = () => {
      let done = false;
      const current = useWatchStore.getState().watches.find((w) => w.id === id);
      if (!current) return; // deleted mid-sync
      const next = current.progress + STEP;
      if (next >= 100) {
        updateWatch(id, { status: "linked", progress: 100 });
        done = true;
      } else {
        updateWatch(id, { progress: next });
      }
      if (!done) timers.current.push(setTimeout(tick, STEP_MS));
    };
    timers.current.push(setTimeout(tick, STEP_MS));
  };

  const handleSearch = () => {
    if (searching) return;
    setSearching(true);
    timers.current.push(
      setTimeout(() => {
        setSearching(false);
        if (!hasWatch("Dora Smartwatch")) {
          const id = addWatch({
            name: "Dora Smartwatch",
            signal: "strong",
            status: "syncing",
            progress: 0,
            kind: "watch",
          });
          runSync(id);
        }
      }, SEARCH_MS),
    );
  };

  const toggleLink = (watch: Watch) => {
    if (watch.status === "linked") {
      updateWatch(watch.id, { status: "linkable" });
    } else if (watch.status === "linkable") {
      updateWatch(watch.id, { status: "syncing", progress: 0 });
      runSync(watch.id);
    }
  };

  return (
    <SettingsScreen title="DEVICE SYNC">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
      >
        {/* Scan control */}
        <View className="h-56 items-center justify-center">
          {searching ? (
            <View className="items-center gap-5">
              <DotsSpinner size={56} color={colors.primary} />
              <AppText tone="brandMuted" className="text-base">
                Searching for nearby devices…
              </AppText>
            </View>
          ) : (
            <View className="items-center gap-4">
              <AppText tone="brandMuted" className="text-base">
                Start searching
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Search for nearby devices"
                onPress={handleSearch}
                style={{
                  width: CIRCLE_SIZE,
                  height: CIRCLE_SIZE,
                  backgroundColor: colors.primaryMuted,
                }}
                className="items-center justify-center rounded-full active:opacity-80"
              >
                <WatchIcon size={56} />
              </Pressable>
            </View>
          )}
        </View>

        {/* Discovered devices */}
        <AppText
          variant="caption"
          tone="brandMuted"
          className="mb-3 font-semibold tracking-[1.5px]"
        >
          DISCOVERED DEVICES
        </AppText>

        <View className="gap-3">
          {watches.map((watch) => (
            <WatchRow
              key={watch.id}
              watch={watch}
              onToggleLink={() => toggleLink(watch)}
              onDelete={() => removeWatch(watch.id)}
            />
          ))}
        </View>
      </ScrollView>
    </SettingsScreen>
  );
}
