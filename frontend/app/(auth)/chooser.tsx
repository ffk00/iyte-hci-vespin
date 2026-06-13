import { Image, Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { WaveDivider } from "@/components/layout/WaveDivider";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { SocialButton } from "@/components/ui/SocialButton";
import { Mark } from "@/components/brand/Mark";
import { useTranslation } from "@/providers/I18nProvider";

const SPOTIFY = require("../../assets/spotify-logo.png");

export default function ChooserScreen() {
  const { t } = useTranslation();

  return (
    <Screen tone="default" padded={false} edges={["top", "bottom"]}>
      {/* Decorative tonal split: cream above the wave, redder cream below. */}
      <WaveDivider className="absolute inset-x-0 bottom-0 top-[27%]" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 px-6 pb-2">
          {/* Brand + welcome centered in the space above the actions. */}
          <View className="flex-1 items-center justify-center gap-5">
            <Mark size="xl" />
            <View className="items-center gap-2">
              <AppText variant="headline" tone="brand" className="text-center">
                {t("auth.chooser.heading")}
              </AppText>
              <AppText variant="body" tone="brandMuted" className="text-center">
                {t("auth.chooser.subtitle")}
              </AppText>
            </View>
          </View>

          {/* Guest link and primary actions. */}
          <View className="gap-3">
            <Pressable
              accessibilityRole="link"
              hitSlop={8}
              className="items-center py-2"
              onPress={() => router.push("/(auth)/guest")}
            >
              <AppText variant="body" tone="brandMuted">
                {t("auth.chooser.guest")}
              </AppText>
            </Pressable>

            <Button
              label={t("auth.chooser.login")}
              variant="primary"
              size="lg"
              fullWidth
              onPress={() => router.push("/(auth)/login")}
            />
            <Button
              label={t("auth.chooser.register")}
              variant="primary"
              size="lg"
              fullWidth
              onPress={() => router.push("/(auth)/register")}
            />
          </View>

          {/* Bottom cluster: social sign-in, anchored to the base. */}
          <View className="gap-6 pt-8">
            <View className="flex-row items-center gap-3">
              <View className="h-px flex-1 bg-primary/20" />
              <AppText variant="caption" tone="brandMuted">
                {t("auth.chooser.or")}
              </AppText>
              <View className="h-px flex-1 bg-primary/20" />
            </View>

            <View className="flex-row items-center justify-center gap-5">
              <SocialButton accessibilityLabel="Google">
                <GoogleIcon size={26} />
              </SocialButton>
              <SocialButton accessibilityLabel="Apple">
                <Icon name="logo-apple" size="lg" />
              </SocialButton>
              <SocialButton accessibilityLabel="Spotify">
                <Image source={SPOTIFY} resizeMode="contain" className="h-7 w-7" />
              </SocialButton>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
