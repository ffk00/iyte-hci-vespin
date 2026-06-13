import { Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/providers/I18nProvider";

const HERO = require("../../assets/images/hero-welcome.png");
const WELCOME_DISC = require("../../assets/blur-circle_welcome.png");

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Screen tone="default" padded={false} edges={["top"]}>
      <View className="flex-1">
        {/* Portrait spans the full width and its bottom edge sits flush with the
            device's bottom edge. Height follows the asset's 564x592 aspect ratio
            so nothing is cropped or distorted. */}
        <Image
          source={HERO}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={t("auth.welcome.title")}
          className="absolute inset-x-0 bottom-0 w-full"
          style={{ aspectRatio: 564 / 592 }}
        />

        {/* Frosted welcome disc floats over the head. */}
        <View className="absolute inset-x-0 top-[42%] items-center">
          <Image source={WELCOME_DISC} resizeMode="contain" className="h-72 w-72" />
        </View>

        {/* Legal + action pinned to the bottom over the dark jacket, so the
            light copy stays legible. */}
        <View
          className="absolute inset-x-0 bottom-0 items-center gap-4 px-6"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <AppText variant="caption" tone="onPrimary" className="text-center">
            {t("auth.welcome.termsPrefix")}
            <AppText variant="caption" tone="onPrimary" className="underline">
              {t("auth.welcome.termsOfUse")}
            </AppText>
            {t("auth.welcome.termsAnd")}
            <AppText variant="caption" tone="onPrimary" className="underline">
              {t("auth.welcome.privacy")}
            </AppText>
            {t("auth.welcome.termsSuffix")}
          </AppText>
          <Button
            label={t("auth.welcome.start")}
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.push("/(auth)/chooser")}
          />
        </View>
      </View>
    </Screen>
  );
}
