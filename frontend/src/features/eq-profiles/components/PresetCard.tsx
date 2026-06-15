import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { EqIcon } from "../modeIcons";
import type { EqProfile } from "../store";

const PRESET_INK = "#440812";
const ACTIVE_BG = "#EAD9D9";
const CARD_BORDER = "#E7D8D5";

type Props = {
  profile: EqProfile;
  active: boolean;
  onPress: () => void;
};

/** A factory-preset tile in the 2-column "Factory Tuning" grid. */
export function PresetCard({ profile, active, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={{
        minHeight: 130,
        backgroundColor: active ? ACTIVE_BG : undefined,
        borderColor: CARD_BORDER,
      }}
      className="flex-1 rounded-2xl border bg-surface p-4"
    >
      <View className="flex-row items-start justify-between">
        <EqIcon name={profile.icon} size={26} color={PRESET_INK} />
        {active ? (
          <View className="rounded-full bg-surface px-2 py-1">
            <AppText
              variant="caption"
              tone="brandMuted"
              className="text-[10px] font-bold tracking-[1px]"
            >
              ACTIVE
            </AppText>
          </View>
        ) : null}
      </View>

      <View className="mt-auto pt-4">
        <AppText className="text-[20px] font-bold" style={{ color: PRESET_INK }}>
          {profile.name}
        </AppText>
        {profile.subtitle ? (
          <AppText variant="caption" tone="muted" className="mt-0.5">
            {profile.subtitle}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}
