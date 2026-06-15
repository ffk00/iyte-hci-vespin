import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { colors } from "@/theme/colors";
import { useLogout } from "@/features/auth/hooks/useAuthActions";
import { SettingsScreen } from "./SettingsScreen";

// Design-specific values from the mockup (local, like the EQ feature).
const CARD_BORDER = "#E2D2CF";
const DIVIDER = "#EADDDA";
const FIELD_BG = "#8C5B61"; // filled password field / mail tile
const LABEL_INK = "#8C5B61";
const VALUE_INK = "#2A050B";

// Static demo values — this screen is a visual mockup; only Log Out is wired.
const PERSONAL = [
  { label: "Phone Number", value: "+1 (555) 902-4412" },
  { label: "Region", value: "Western Europe" },
  { label: "Language", value: "English (UK)" },
];

export function AccountDetails() {
  const logout = useLogout();

  const onLogout = () => {
    logout.mutate(undefined, { onSuccess: () => router.replace("/(auth)/login") });
  };

  return (
    <SettingsScreen title="ACCOUNT DETAILS">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24, gap: 18 }}
      >
        {/* Login information */}
        <Card>
          <View className="flex-row items-center justify-between">
            <CardTitle>LOGIN INFORMATION</CardTitle>
            <Ionicons name="information-circle-outline" size={22} color={colors.primaryMuted} />
          </View>
          <View className="mt-3 flex-row items-center gap-3">
            <View
              style={{ backgroundColor: FIELD_BG }}
              className="h-12 w-12 items-center justify-center rounded-xl"
            >
              <Ionicons name="mail" size={22} color={colors.onPrimary} />
            </View>
            <View>
              <AppText className="text-lg font-bold" style={{ color: VALUE_INK }}>
                Email Address
              </AppText>
              <AppText variant="caption" tone="muted">
                Verified via Google
              </AppText>
            </View>
          </View>
        </Card>

        {/* Password */}
        <View className="gap-2">
          <Card>
            <View className="flex-row items-center justify-between">
              <CardTitle>PASSWORD</CardTitle>
              <AppText variant="caption" tone="brandMuted" className="font-semibold">
                Edit
              </AppText>
            </View>
            <View
              style={{ backgroundColor: FIELD_BG }}
              className="mt-3 h-12 flex-row items-center justify-between rounded-xl px-4"
            >
              <AppText tone="onPrimary" className="text-base tracking-[2px]">
                ••••••••••
              </AppText>
              <Ionicons name="eye-off-outline" size={20} color={colors.onPrimary} />
            </View>
          </Card>
          <View className="flex-row justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <View key={i} style={{ backgroundColor: CARD_BORDER }} className="h-1 w-1 rounded-full" />
            ))}
          </View>
        </View>

        {/* Personal details */}
        <Card>
          <CardTitle>PERSONAL DETAILS</CardTitle>
          <View className="mt-3">
            {PERSONAL.map((field, i) => (
              <View
                key={field.label}
                style={
                  i > 0
                    ? { borderTopWidth: 1, borderTopColor: DIVIDER, marginTop: 14, paddingTop: 14 }
                    : undefined
                }
              >
                <AppText variant="caption" style={{ color: LABEL_INK }}>
                  {field.label}
                </AppText>
                <AppText className="mt-1 text-base" style={{ color: VALUE_INK }}>
                  {field.value}
                </AppText>
              </View>
            ))}
          </View>
        </Card>

        <View className="mt-2">
          <Button
            label={logout.isPending ? "Logging out…" : "LOG OUT"}
            variant="primary"
            size="lg"
            fullWidth
            disabled={logout.isPending}
            onPress={onLogout}
          />
        </View>
      </ScrollView>
    </SettingsScreen>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ borderColor: CARD_BORDER }} className="rounded-2xl border bg-surface p-4">
      {children}
    </View>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <AppText variant="caption" tone="brandMuted" className="font-semibold tracking-[1.5px]">
      {children}
    </AppText>
  );
}
