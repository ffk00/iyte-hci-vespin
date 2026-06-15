import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { WaveDivider } from "@/components/layout/WaveDivider";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/providers/I18nProvider";
import { AuthHero } from "./AuthHero";
import { SocialRow } from "./SocialRow";
import { TermsNote } from "./TermsNote";

/** "Welcome to VESPIN" entry chooser: log in or sign up, with decorative
 *  social providers. Reached from Welcome's "Start". */
export function Chooser() {
  const { t } = useTranslation();

  return (
    <Screen tone="default" padded={false} edges={["top", "bottom"]}>
      <WaveDivider className="absolute inset-x-0 top-0 h-[30%]" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 }}
      >
        <AuthHero showBack />

        <View className="flex-1 justify-center gap-8">
          <View className="items-center gap-2">
            <AppText variant="headline" tone="brand" className="text-center">
              {t("auth.chooser.heading")}
            </AppText>
            <AppText variant="body" tone="brandMuted" className="text-center">
              {t("auth.chooser.subtitle")}
            </AppText>
          </View>

          <View className="gap-4">
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
        </View>

        <View className="gap-6 pb-2">
          <SocialRow />
          <TermsNote />
        </View>
      </ScrollView>
    </Screen>
  );
}
