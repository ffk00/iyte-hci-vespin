import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/colors";
import { EqIcon } from "../modeIcons";
import { usedLabel } from "../relativeTime";
import type { EqProfile } from "../store";

const ROW_INK = "#440812";
const CARD_BORDER = "#E7D8D5";

type Props = {
  profile: EqProfile;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

/** A user "Personal Tone" row: icon tile, name, last-used, edit + delete. */
export function ToneRow({ profile, onPress, onEdit, onDelete }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{ borderColor: CARD_BORDER }}
      className="flex-row items-center rounded-2xl border bg-surface p-3"
    >
      <View className="h-12 w-12 items-center justify-center rounded-xl bg-primaryMuted">
        <EqIcon name={profile.icon} size={26} color={colors.onPrimary} />
      </View>

      <View className="ml-3 flex-1">
        <AppText className="text-[17px] font-bold" style={{ color: ROW_INK }}>
          {profile.name}
        </AppText>
        <AppText variant="caption" tone="muted" className="mt-0.5">
          {usedLabel(profile.lastUsedAt)}
        </AppText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Edit ${profile.name}`}
        hitSlop={8}
        onPress={onEdit}
        className="h-10 w-10 items-center justify-center"
      >
        <Ionicons name="pencil" size={18} color={colors.primaryMuted} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Delete ${profile.name}`}
        hitSlop={8}
        onPress={onDelete}
        className="h-10 w-10 items-center justify-center"
      >
        <Ionicons name="trash-outline" size={18} color={colors.primaryMuted} />
      </Pressable>
    </Pressable>
  );
}
