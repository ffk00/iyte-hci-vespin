import { useMemo, useState } from "react";
import { Pressable, TextInput, View, type LayoutChangeEvent } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { colors } from "@/theme/colors";
import { EqScreen } from "./EqScreen";
import { flatBands } from "../bands";
import { EqIcon, type EqIconName } from "../modeIcons";
import { useEqStore, type EqProfile } from "../store";
import { FineTuningCard } from "./FineTuningCard";
import { ModeIconPicker } from "./ModeIconPicker";

const ICON_BUTTON_SIZE = 72;

type Props = {
  /** Editing an existing profile, or undefined to create a new one. */
  profile?: EqProfile;
};

/**
 * The shared EQ editor used by both `eq/new` and `eq/[id]`. The icon button at
 * the top opens the mode-icon picker; the title is inline-editable; the faders
 * drive the 10-band curve. Save persists to the local store and returns to the
 * list; Reset reverts to the values the editor opened with.
 */
export function EqEditor({ profile }: Props) {
  const create = useEqStore((s) => s.create);
  const update = useEqStore((s) => s.update);

  // The values the editor opened with — Reset restores these.
  const baseline = useMemo(
    () => ({
      name: profile?.name ?? "",
      icon: profile?.icon ?? ("none" as EqIconName),
      bands: profile ? [...profile.bands] : flatBands(),
    }),
    [profile],
  );

  const [name, setName] = useState(baseline.name);
  const [icon, setIcon] = useState<EqIconName>(baseline.icon);
  const [bands, setBands] = useState<number[]>(baseline.bands);
  const [pickerOpen, setPickerOpen] = useState(false);
  // Y of the icon-button block within the relative container, so the picker
  // caret can point at the button's bottom edge.
  const [headerY, setHeaderY] = useState(0);

  const onHeaderLayout = (e: LayoutChangeEvent) => setHeaderY(e.nativeEvent.layout.y);

  const setBand = (index: number, db: number) =>
    setBands((prev) => prev.map((v, i) => (i === index ? db : v)));

  const reset = () => {
    setName(baseline.name);
    setIcon(baseline.icon);
    setBands([...baseline.bands]);
  };

  const save = () => {
    const finalName = name.trim() || "Untitled";
    if (profile) {
      update(profile.id, { name: finalName, icon, bands });
    } else {
      create({ name: finalName, icon, bands });
    }
    router.back();
  };

  return (
    <EqScreen>
      <View className="flex-1">
        <View className="flex-row">
          <IconButton
            name="chevron-back"
            accessibilityLabel="Back"
            tone="default"
            onPress={() => router.back()}
            className="-ml-2"
          />
        </View>

        <View className="items-center pt-2" onLayout={onHeaderLayout}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change mode icon"
            onPress={() => setPickerOpen((v) => !v)}
            style={{ width: ICON_BUTTON_SIZE, height: ICON_BUTTON_SIZE }}
            className="items-center justify-center rounded-xl bg-primaryMuted"
          >
            <EqIcon name={icon} size={40} color={colors.onPrimary} />
          </Pressable>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Mode name"
            placeholderTextColor={colors.primaryMuted}
            className="mt-4 text-center text-[28px] font-bold text-primary"
            maxLength={24}
          />
        </View>

        <View className="mt-7">
          <FineTuningCard bands={bands} onChange={setBand} />
        </View>

        <View className="mt-auto gap-3 pb-2">
          <Button label="Save Changes" variant="primary" size="lg" fullWidth onPress={save} />
          <Button label="Reset" variant="secondary" size="lg" fullWidth onPress={reset} />
        </View>

        {pickerOpen ? (
          <ModeIconPicker
            top={headerY + 8 + ICON_BUTTON_SIZE}
            selected={icon}
            onSelect={(next) => {
              setIcon(next);
              setPickerOpen(false);
            }}
            onClose={() => setPickerOpen(false)}
          />
        ) : null}
      </View>
    </EqScreen>
  );
}
