import { View, type ViewProps } from "react-native";
import { router } from "expo-router";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";

/** Pop the stack, falling back to the Settings tab if there's no history. */
function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace("/(app)/(tabs)/settings");
}

type Props = ViewProps & {
  /** Centered, uppercase header title (e.g. "SETTINGS"). */
  title: string;
  /** Show the back chevron. Off for tab roots (the Settings home), which have
   *  nothing to pop back to. */
  showBack?: boolean;
  edges?: readonly Edge[];
  className?: string;
};

/**
 * Edge-to-edge screen on the settings background fill (#F4E9E6) with the shared
 * header from the mockups: a back chevron pinned left and an uppercase, tracked
 * title centered. Mirrors `EqScreen` so the safe-area insets share the same flat
 * fill (no seam at the notch).
 */
export function SettingsScreen({
  title,
  showBack = true,
  edges = ["top", "bottom"],
  className,
  children,
  ...rest
}: Props) {
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-backgroundAlt">
      <View className="h-12 justify-center">
        {showBack ? (
          <View className="absolute bottom-0 left-1 top-0 z-10 justify-center">
            <IconButton name="chevron-back" accessibilityLabel="Back" onPress={goBack} />
          </View>
        ) : null}
        <AppText
          variant="caption"
          tone="brandMuted"
          className="text-center font-semibold tracking-[2px]"
        >
          {title}
        </AppText>
      </View>

      <View className={["flex-1 px-5", className].filter(Boolean).join(" ")} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}
