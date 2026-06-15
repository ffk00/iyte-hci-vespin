import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { WaveDivider } from "@/components/layout/WaveDivider";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/providers/I18nProvider";
import { useRegister } from "../hooks/useAuthActions";
import { registerSchema, type RegisterInput } from "../schemas/register";
import { AuthField } from "./AuthField";
import { AuthHero } from "./AuthHero";
import { SocialRow } from "./SocialRow";

export function RegisterForm() {
  const { t } = useTranslation();
  const register = useRegister();
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", displayName: "" },
  });

  const submit = form.handleSubmit((values) => register.mutate(values));

  return (
    <Screen tone="default" padded={false} edges={["top", "bottom"]}>
      <WaveDivider className="absolute inset-x-0 top-0 h-[34%]" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 }}
      >
        <AuthHero showBack />

        <View className="flex-1 justify-center gap-6">
          <View className="gap-1">
            <AppText variant="headline" tone="brand">
              {t("auth.register.title")}
            </AppText>
            <AppText variant="body" tone="brandMuted">
              {t("auth.register.subtitle")}
            </AppText>
          </View>

          <View className="gap-3">
          <Controller
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <AuthField
                icon="person-outline"
                placeholder={t("auth.fields.fullName")}
                autoCapitalize="words"
                autoComplete="name"
                value={field.value ?? ""}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
              />
            )}
          />
          <Controller
            control={form.control}
            name="email"
            render={({ field }) => (
              <AuthField
                icon="mail-outline"
                placeholder={t("auth.fields.emailOrPhone")}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
              />
            )}
          />
          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <>
                <AuthField
                  icon="lock-closed-outline"
                  placeholder={t("auth.fields.password")}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  secureTextEntry
                  value={field.value}
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                />
                {fieldState.error?.message ? (
                  <AppText variant="caption" tone="danger">
                    {t(fieldState.error.message)}
                  </AppText>
                ) : null}
              </>
            )}
          />

          <Button
            label={register.isPending ? t("auth.register.submitting") : t("auth.register.submit")}
            variant="primary"
            size="lg"
            fullWidth
            disabled={register.isPending}
            onPress={submit}
            className="mt-1"
          />

          <View className="flex-row items-center justify-center gap-2 py-1">
            <AppText variant="caption" tone="muted">
              {t("auth.register.haveAccount")}
            </AppText>
            <Pressable accessibilityRole="link" hitSlop={8} onPress={() => router.push("/(auth)/login")}>
              <AppText variant="caption" tone="brand" className="font-bold">
                {t("auth.register.loginLink")}
              </AppText>
            </Pressable>
          </View>
          </View>
        </View>

        <View className="pb-2">
          <SocialRow />
        </View>
      </ScrollView>
    </Screen>
  );
}
