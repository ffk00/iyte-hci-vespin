import { View } from "react-native";
import { router } from "expo-router";
import { IconButton } from "@/components/ui/IconButton";
import { Mark } from "@/components/brand/Mark";

type Props = {
  /** Show a back chevron pinned top-left (pops the stack). */
  showBack?: boolean;
};

/** Centered Vespin mark with an optional back chevron — the shared top of the
 *  chooser, login, and sign-up screens. */
export function AuthHero({ showBack = false }: Props) {
  return (
    <View className="items-center pb-4 pt-2">
      {showBack ? (
        <View className="absolute left-0 top-0 z-10">
          <IconButton
            name="chevron-back"
            accessibilityLabel="Back"
            tone="brandMuted"
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(auth)/welcome"))}
          />
        </View>
      ) : null}
      <Mark size="lg" />
    </View>
  );
}
