import { Image, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/providers/I18nProvider";
import { useContinueAsGuest } from "../hooks/useAuthActions";

const HERO = require("../../../../assets/images/hero-welcome.png");
const WELCOME_DISC = require("../../../../assets/blur-circle_welcome.png");

/**
 * Landing screen after onboarding: full-bleed portrait, a frosted "WELCOME"
 * disc, legal links, and the two entry actions. "Start" goes to the auth
 * chooser; the secondary action logs in as a guest (real backend session).
 */
export function Welcome() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const guest = useContinueAsGuest();

  return (
    <Screen tone="default" padded={false} edges={["top"]}>
      <View className="flex-1">
        <Image
          source={HERO}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={t("auth.welcome.title")}
          className="absolute inset-x-0 bottom-0 w-full"
          style={{ aspectRatio: 564 / 592 }}
        />

        {/* Frosted welcome disc (the "WELCOME" wordmark is baked into the art). */}
        <View className="absolute inset-x-0 top-[42%] items-center">
          <Image
            source={WELCOME_DISC}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel={t("auth.welcome.title")}
            className="h-72 w-72"
          />
        </View>

        {/* Legal links + actions pinned to the bottom. */}
        <View
          className="absolute inset-x-0 bottom-0 items-center gap-3 px-6"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="items-center gap-2 pb-2">
            <Pressable accessibilityRole="link" hitSlop={8}>
              <AppText variant="body" tone="onPrimary">
                {t("auth.welcome.licence")}
              </AppText>
            </Pressable>
            <Pressable accessibilityRole="link" hitSlop={8}>
              <AppText variant="body" tone="onPrimary">
                {t("auth.welcome.privacy")}
              </AppText>
            </Pressable>
          </View>

          <Button
            label={t("auth.welcome.start")}
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.push("/(auth)/chooser")}
          />
          <Button
            label={t("auth.welcome.guestStart")}
            variant="secondary"
            size="lg"
            fullWidth
            labelTone="brand"
            disabled={guest.isPending}
            onPress={() => guest.mutate()}
          />
        </View>
      </View>
    </Screen>
  );
}
