import { Fragment } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { SettingsScreen } from "./SettingsScreen";

// Design-specific values from the mockups (kept local, like the EQ feature).
const SECTION_INK = "#8C5B61"; // dusty-maroon section headings
const ROW_INK = "#2A050B"; // near-black maroon row labels
const CARD_BORDER = "#E2D2CF";
const DIVIDER = "#EADDDA";

type Row = { label: string; href?: string };
type SettingsSection = { title: string; rows: Row[] };

const SECTIONS: SettingsSection[] = [
  {
    title: "Account",
    rows: [
      { label: "Account Details", href: "/settings/account" },
      { label: "Smart Watch Connection", href: "/settings/device-sync" },
    ],
  },
  { title: "Personalization", rows: [{ label: "Theme" }] },
  {
    title: "Support",
    rows: [{ label: "Help Center" }, { label: "Contact us" }, { label: "Feedback" }],
  },
  {
    title: "System",
    rows: [{ label: "Software Updates" }, { label: "Permissions" }, { label: "Notifications" }],
  },
  {
    title: "About",
    rows: [
      { label: "Version 1.4.2" },
      { label: "Terms of Service" },
      { label: "Privacy Policy" },
    ],
  },
];

/** The Settings tab: grouped cards of rows. Only the two rows with mockups
 *  navigate; the rest render exactly as designed but are inert in this demo. */
export function SettingsHome() {
  return (
    <SettingsScreen title="SETTINGS" showBack={false} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24, gap: 24 }}
      >
        {SECTIONS.map((section) => (
          <View key={section.title} className="gap-3">
            <AppText className="text-[22px] font-bold" style={{ color: SECTION_INK }}>
              {section.title}
            </AppText>

            <View
              style={{ borderColor: CARD_BORDER }}
              className="overflow-hidden rounded-2xl border bg-surface"
            >
              {section.rows.map((row, i) => (
                <Fragment key={row.label}>
                  {i > 0 ? (
                    <View style={{ height: 1, marginHorizontal: 16, backgroundColor: DIVIDER }} />
                  ) : null}
                  <SettingsRow
                    label={row.label}
                    onPress={row.href ? () => router.push(row.href as never) : undefined}
                  />
                </Fragment>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SettingsScreen>
  );
}

function SettingsRow({ label, onPress }: { label: string; onPress?: () => void }) {
  const content = (
    <AppText className="text-base" style={{ color: ROW_INK }}>
      {label}
    </AppText>
  );

  if (!onPress) {
    return <View className="h-[52px] justify-center px-4">{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="h-[52px] justify-center px-4 active:opacity-60"
    >
      {content}
    </Pressable>
  );
}
