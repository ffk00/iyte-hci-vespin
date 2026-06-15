import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/providers/I18nProvider";
import { AuthField } from "./AuthField";

/**
 * Step 1 of the (demo) password-reset flow. No validation: "Send message"
 * always advances to verification, per the local-only demo brief.
 */
export function ForgotPassword() {
  const { t } = useTranslation();
  const [value, setValue] = useState("");

  return (
    <Screen tone="default" edges={["top", "bottom"]}>
      <View className="flex-1 justify-center gap-10">
        <AppText variant="headline" tone="brand" className="text-[40px] leading-[46px]">
          {t("auth.forgot.title")}
        </AppText>

        <View className="gap-3">
          <AppText variant="body" tone="brand" className="font-bold">
            {t("auth.forgot.label")}
          </AppText>
          <AuthField
            placeholder={t("auth.fields.phonePlaceholder")}
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onChangeText={setValue}
          />
          <Button
            label={t("auth.forgot.send")}
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.push("/(auth)/verify")}
          />
        </View>

        <Pressable
          accessibilityRole="link"
          hitSlop={8}
          className="items-center"
          onPress={() => router.replace("/(auth)/welcome")}
        >
          <AppText variant="body" tone="brand" className="font-semibold">
            {t("auth.forgot.backHome")}
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}
