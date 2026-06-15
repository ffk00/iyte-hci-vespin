import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, ScrollView, TextInput, View } from "react-native";
import { router } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/colors";
import { EqScreen } from "./EqScreen";
import { useEqStore, type EqProfile } from "../store";
import { PresetCard } from "./PresetCard";
import { ToneRow } from "./ToneRow";

const HEADING_INK = "#3A0A12";
const CARD_BORDER = "#E7D8D5";

/** The EQ tab: searchable factory presets grid + editable personal tones. */
export function EqHome() {
  const profiles = useEqStore((s) => s.profiles);
  const activeId = useEqStore((s) => s.activeId);
  const apply = useEqStore((s) => s.apply);
  const remove = useEqStore((s) => s.remove);

  const [query, setQuery] = useState("");

  const { factory, tones } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (p: EqProfile) => !q || p.name.toLowerCase().includes(q);
    return {
      factory: profiles.filter((p) => p.isSystem && match(p)),
      tones: profiles
        .filter((p) => !p.isSystem && match(p))
        .sort(
          (a, b) =>
            new Date(b.lastUsedAt ?? b.createdAt).getTime() -
            new Date(a.lastUsedAt ?? a.createdAt).getTime(),
        ),
    };
  }, [profiles, query]);

  const factoryRows = chunk(factory, 2);

  const confirmDelete = (profile: EqProfile) =>
    Alert.alert("Delete preset", `Remove “${profile.name}”?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => remove(profile.id) },
    ]);

  return (
    <EqScreen edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 24, gap: 28 }}
      >
        {/* Search */}
        <View
          style={{ borderColor: CARD_BORDER }}
          className="h-14 flex-row items-center gap-2 rounded-2xl border bg-surface px-4"
        >
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search presets..."
            placeholderTextColor={colors.muted}
            className="flex-1 text-base text-ink"
          />
        </View>

        {/* Factory Tuning */}
        <View className="gap-3">
          <AppText className="text-[22px] font-bold" style={{ color: HEADING_INK }}>
            Factory Tuning
          </AppText>
          {factoryRows.map((row, i) => (
            <View key={i} className="flex-row gap-3">
              {row.map((p) => (
                <PresetCard
                  key={p.id}
                  profile={p}
                  active={p.id === activeId}
                  onPress={() => apply(p.id)}
                />
              ))}
              {row.length === 1 ? <View className="flex-1" /> : null}
            </View>
          ))}
          {factory.length === 0 ? (
            <AppText tone="muted">No factory presets match.</AppText>
          ) : null}
        </View>

        {/* Personal Tones */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <AppText className="text-[22px] font-bold" style={{ color: HEADING_INK }}>
              Personal Tones
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="New preset"
              onPress={() => router.push("/eq/new")}
              className="flex-row items-center gap-1 rounded-full bg-primaryMuted px-3 py-2"
            >
              <Ionicons name="add" size={16} color={colors.onPrimary} />
              <AppText
                variant="caption"
                tone="onPrimary"
                className="font-bold tracking-[0.5px]"
              >
                NEW PRESET
              </AppText>
            </Pressable>
          </View>

          {tones.map((p) => (
            <ToneRow
              key={p.id}
              profile={p}
              onPress={() => apply(p.id)}
              onEdit={() => router.push(`/eq/${p.id}`)}
              onDelete={() => confirmDelete(p)}
            />
          ))}
          {tones.length === 0 ? (
            <AppText tone="muted">
              {query ? "No personal tones match." : "No personal tones yet."}
            </AppText>
          ) : null}
        </View>
      </ScrollView>
    </EqScreen>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
}
