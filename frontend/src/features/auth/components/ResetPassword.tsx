import { useMemo, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/providers/I18nProvider";
import { AuthField } from "./AuthField";

type StrengthKey = "weak" | "fair" | "good" | "excellent";

/** A simple length-based strength estimate for the demo: longer == stronger.
 *  Returns how many of the 4 segments to fill and the matching label key. */
function scorePassword(length: number): { bars: number; key: StrengthKey | null } {
  if (length === 0) return { bars: 0, key: null };
  if (length < 5) return { bars: 1, key: "weak" };
  if (length < 8) return { bars: 2, key: "fair" };
  if (length < 12) return { bars: 3, key: "good" };
  return { bars: 4, key: "excellent" };
}

/** Step 3 of the demo reset flow. The strength meter reacts to password length;
 *  "Save your password" always advances to the success screen (no validation). */
export function ResetPassword() {
  const { t } = useTranslation();
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const strength = useMemo(() => scorePassword(next.length), [next]);

  return (
    <Screen tone="default" edges={["top", "bottom"]}>
      <View className="flex-1 justify-center gap-8">
        <AppText variant="headline" tone="brand" className="text-center text-[40px] leading-[46px]">
          {t("auth.reset.title")}
        </AppText>

        <View className="gap-3">
          <AppText variant="body" tone="brand" className="font-bold">
            {t("auth.reset.newLabel")}
          </AppText>
          <AuthField
            placeholder={t("auth.fields.password")}
            autoCapitalize="none"
            secureTextEntry
            value={next}
            onChangeText={setNext}
          />
          <View className="flex-row gap-2">
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                className={`h-1.5 flex-1 rounded-pill ${i < strength.bars ? "bg-primaryMuted" : "bg-primaryMuted/25"}`}
              />
            ))}
          </View>
          {strength.key ? (
            <View className="flex-row gap-2">
              <AppText variant="caption" tone="brandMuted">
                {t("auth.reset.strength")}
              </AppText>
              <AppText variant="caption" tone="brand" className="font-bold">
                {t(`auth.reset.${strength.key}`)}
              </AppText>
            </View>
          ) : null}
        </View>

        <View className="gap-3">
          <AppText variant="body" tone="brand" className="font-bold">
            {t("auth.reset.reLabel")}
          </AppText>
          <AuthField
            placeholder={t("auth.fields.password")}
            autoCapitalize="none"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />
        </View>

        <Button
          label={t("auth.reset.save")}
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.replace("/(auth)/password-changed")}
        />
      </View>
    </Screen>
  );
}
