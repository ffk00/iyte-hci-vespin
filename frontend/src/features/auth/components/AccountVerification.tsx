import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useTranslation } from "@/providers/I18nProvider";
import { AuthField } from "./AuthField";

/** Step 2 of the demo reset flow: enter the code. "Send message" always
 *  advances to the reset screen; no code is actually checked. */
export function AccountVerification() {
  const { t } = useTranslation();
  const [code, setCode] = useState("");

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/(auth)/forgot-password"));

  return (
    <Screen tone="default" edges={["top", "bottom"]}>
      <View className="flex-1 justify-center gap-10">
        <AppText variant="headline" tone="brand" className="text-[40px] leading-[46px]">
          {t("auth.verify.title")}
        </AppText>

        <View className="gap-3">
          <AppText variant="body" tone="brand" className="font-bold">
            {t("auth.verify.label")}
          </AppText>
          <AuthField
            placeholder={t("auth.fields.code")}
            autoCapitalize="characters"
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
          />
          <Button
            label={t("auth.verify.send")}
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.push("/(auth)/reset-password")}
          />
        </View>

        <Pressable
          accessibilityRole="link"
          hitSlop={8}
          className="flex-row items-center justify-center gap-1"
          onPress={goBack}
        >
          <Icon name="arrow-back" size="sm" tone="brand" />
          <AppText variant="body" tone="brand" className="font-semibold">
            {t("auth.verify.goBack")}
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}
