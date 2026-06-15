import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { WaveDivider } from "@/components/layout/WaveDivider";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useTranslation } from "@/providers/I18nProvider";
import { useLogin } from "../hooks/useAuthActions";
import { loginSchema, type LoginInput } from "../schemas/login";
import { AuthField } from "./AuthField";
import { AuthHero } from "./AuthHero";
import { SocialRow } from "./SocialRow";
import { TermsNote } from "./TermsNote";

export function LoginForm() {
  const { t } = useTranslation();
  const login = useLogin();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const submit = form.handleSubmit((values) => login.mutate(values));

  return (
    <Screen tone="default" padded={false} edges={["top", "bottom"]}>
      <WaveDivider className="absolute inset-x-0 top-0 h-[30%]" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 }}
      >
        <AuthHero showBack />

        <View className="flex-1 justify-center gap-6">
          <View className="gap-1">
            <AppText variant="headline" tone="brand">
              {t("auth.login.title")}
            </AppText>
            <AppText variant="body" tone="brandMuted">
              {t("auth.login.subtitle")}
            </AppText>
          </View>

          <View className="gap-3">
          <Controller
            control={form.control}
            name="email"
            render={({ field }) => (
              <AuthField
                icon="person-outline"
                placeholder={t("auth.fields.fullName")}
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
            render={({ field }) => (
              <AuthField
                icon="lock-closed-outline"
                placeholder={t("auth.fields.password")}
                autoCapitalize="none"
                autoComplete="password"
                secureTextEntry
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
              />
            )}
          />

          {login.isError ? (
            <View className="flex-row items-center gap-2">
              <Icon name="alert-circle" size="sm" tone="danger" />
              <AppText variant="caption" tone="danger" className="font-semibold">
                {t("auth.login.incorrect")}
              </AppText>
            </View>
          ) : null}

          <Button
            label={login.isPending ? t("auth.login.submitting") : t("auth.login.submit")}
            variant="primary"
            size="lg"
            fullWidth
            disabled={login.isPending}
            onPress={submit}
            className="mt-1"
          />

          <Pressable
            accessibilityRole="link"
            hitSlop={8}
            className="items-center py-1"
            onPress={() => router.push("/(auth)/forgot-password")}
          >
            <AppText variant="caption" tone="brandMuted">
              {t("auth.login.forgot")}
            </AppText>
          </Pressable>
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
