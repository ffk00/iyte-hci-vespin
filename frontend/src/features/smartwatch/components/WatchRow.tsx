import { Image, Pressable, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/colors";
import type { Watch } from "../store";
import { WatchIcon } from "../watchIcon";

const ECHO_IMAGE = require("../../../../assets/device-sync/echo-point.png");

const REVEAL = 76; // px the row slides to expose the trash action
const TILE_BG = "#221C1C";
const ROW_BORDER = "#E2D2CF";
const LINKED_BG = "#F0DEDE";
const LINKED_BORDER = "#C9A0A4";
const NAME_INK = "#2A050B";
const PROGRESS_TRACK = "#E8D7D4";

type Props = {
  watch: Watch;
  onToggleLink: () => void;
  onDelete: () => void;
};

/** A discovered-device row with swipe-left-to-delete and a state-driven link
 *  control. Swipe is a horizontal pan that yields to the list's vertical scroll. */
export function WatchRow({ watch, onToggleLink, onDelete }: Props) {
  const tx = useSharedValue(0);
  const startX = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-12, 12])
    .onBegin(() => {
      startX.value = tx.value;
    })
    .onUpdate((e) => {
      tx.value = Math.min(0, Math.max(-REVEAL, startX.value + e.translationX));
    })
    .onEnd(() => {
      tx.value = withTiming(tx.value < -REVEAL / 2 ? -REVEAL : 0, { duration: 140 });
    });

  const close = () => {
    tx.value = withTiming(0, { duration: 140 });
  };

  const slide = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }));

  const linked = watch.status === "linked";
  const disabled = watch.status === "disabled";
  const syncing = watch.status === "syncing";

  return (
    <View className="overflow-hidden rounded-2xl">
      {/* Trash action revealed behind the row */}
      <View className="absolute bottom-0 right-0 top-0 flex-row items-center justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delete ${watch.name}`}
          onPress={() => {
            close();
            onDelete();
          }}
          style={{ width: REVEAL }}
          className="h-full items-center justify-center rounded-2xl bg-surfaceAlt active:opacity-70"
        >
          <Ionicons name="trash-outline" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            slide,
            {
              borderColor: linked ? LINKED_BORDER : ROW_BORDER,
              backgroundColor: linked ? LINKED_BG : colors.surface,
            },
          ]}
          className="overflow-hidden rounded-2xl border"
        >
          <View
            style={disabled ? { opacity: 0.55 } : undefined}
            className="flex-row items-center gap-3 px-3 py-3"
          >
            {/* Device tile */}
            {watch.kind === "speaker" ? (
              <Image
                source={ECHO_IMAGE}
                resizeMode="cover"
                className="h-12 w-12 rounded-xl"
              />
            ) : (
              <View
                style={{ backgroundColor: TILE_BG }}
                className="h-12 w-12 items-center justify-center rounded-xl"
              >
                <WatchIcon size={26} />
              </View>
            )}

            {/* Name + status line */}
            <View className="flex-1">
              <AppText className="text-base font-bold" style={{ color: NAME_INK }}>
                {watch.name}
              </AppText>
              {syncing ? (
                <AppText variant="caption" tone="brandMuted" className="mt-0.5 font-semibold">
                  Syncing… {watch.progress}%
                </AppText>
              ) : (
                <View className="mt-0.5 flex-row items-center gap-1">
                  <Ionicons
                    name="cellular"
                    size={13}
                    color={watch.signal === "strong" ? colors.primary : colors.muted}
                  />
                  <AppText
                    variant="caption"
                    tone={watch.signal === "strong" ? "brand" : "muted"}
                    className="font-semibold"
                  >
                    {watch.signal === "strong" ? "Strong Signal" : "Weak Signal"}
                  </AppText>
                </View>
              )}
            </View>

            {/* Link control */}
            <LinkControl watch={watch} onPress={onToggleLink} />
          </View>

          {/* Sync progress bar */}
          {syncing ? (
            <View style={{ backgroundColor: PROGRESS_TRACK }} className="h-1 w-full">
              <View
                style={{ width: `${watch.progress}%`, backgroundColor: colors.primaryMuted }}
                className="h-full"
              />
            </View>
          ) : null}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function LinkControl({ watch, onPress }: { watch: Watch; onPress: () => void }) {
  if (watch.status === "disabled") {
    return <Ionicons name="unlink-outline" size={22} color={colors.muted} />;
  }
  if (watch.status === "syncing") {
    return <Ionicons name="sync-outline" size={22} color={colors.primaryMuted} />;
  }
  const linked = watch.status === "linked";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={linked ? `Unlink ${watch.name}` : `Link ${watch.name}`}
      hitSlop={10}
      onPress={onPress}
      className="active:opacity-60"
    >
      <Ionicons name={linked ? "link" : "link-outline"} size={22} color={colors.primaryMuted} />
    </Pressable>
  );
}
