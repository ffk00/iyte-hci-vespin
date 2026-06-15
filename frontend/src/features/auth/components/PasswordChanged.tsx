import { View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/providers/I18nProvider";
import { PartyIcon } from "./PartyIcon";

/** Final step of the demo reset flow: a confetti confirmation. "Log in again"
 *  returns to the login screen. */
export function PasswordChanged() {
  const { t } = useTranslation();

  return (
    <Screen tone="default" edges={["top", "bottom"]}>
      <View className="flex-1 items-center justify-center gap-8">
        <PartyIcon size={132} />
        <AppText variant="headline" tone="brand" className="text-center text-[34px] leading-10">
          {t("auth.passwordChanged.title")}
        </AppText>
        <Button
          label={t("auth.passwordChanged.login")}
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.replace("/(auth)/login")}
        />
      </View>
    </Screen>
  );
}
