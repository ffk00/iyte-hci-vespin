import { router } from "expo-router";
import { Image, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { AppText } from "@/components/ui/AppText";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Section } from "@/components/layout/Section";
import { SurfaceProvider } from "@/providers/SurfaceProvider";
import { useTranslation } from "@/providers/I18nProvider";
import {
  gradientLocations,
  primitive,
  speakerGradient,
  type SpeakerGradientKey,
} from "@/theme/colors";
import { speakerForType } from "../catalog";
import { useDevices } from "../hooks/useDevices";
import { useDevicePower } from "../store";
import { SpeakerStage } from "./SpeakerStage";

const POWER_ON = require("../../../../assets/power-on-button.png");
const POWER_OFF = require("../../../../assets/power-off-button.png");

const CREAM = primitive.brand.cream[50];

type Props = {
  deviceId: string;
};

export function DeviceDetail({ deviceId }: Props) {
  const { t } = useTranslation();
  const devices = useDevices();
  const device = devices.find((d) => d.id === deviceId);
  const { powered, toggle } = useDevicePower(deviceId);

  const model = device ? speakerForType(device.deviceType) : undefined;
  const gradientColors =
    device && powered
      ? speakerGradient[device.deviceType as SpeakerGradientKey]
      : ([CREAM, CREAM] as const);

  return (
    <View className="flex-1">
      <LinearGradient
        colors={gradientColors as unknown as [string, string]}
        locations={gradientLocations as unknown as [number, number]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <SurfaceProvider tone="default">
        <SafeAreaView edges={["top"]} className="flex-1">
          <View className="flex-1 px-5">
            <View className="flex-row items-center py-2">
              <IconButton
                name="chevron-back"
                accessibilityLabel={t("devices.pair.back")}
                onPress={() => router.back()}
              />
            </View>

            {!device ? (
              <View className="flex-1 items-center justify-center">
                <AppText variant="body" tone="muted">
                  {t("devices.home.noProducts")}
                </AppText>
              </View>
            ) : (
              <ScrollView contentContainerClassName="pb-10" showsVerticalScrollIndicator={false}>
                <SpeakerStage speakers={model ? [model.image] : []} dimmed={!powered} />

                <AppText variant="display" tone="brand" className="mt-2 text-center text-2xl">
                  {device.name}
                </AppText>

                <View className="mt-4 items-center gap-2">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("devices.home.powerLabel")}
                    onPress={toggle}
                    hitSlop={12}
                  >
                    <Image
                      source={powered ? POWER_ON : POWER_OFF}
                      resizeMode="contain"
                      className="h-14 w-14"
                    />
                  </Pressable>
                  <AppText variant="body" tone="muted">
                    {powered ? t("devices.home.connected") : t("devices.home.standby")}
                  </AppText>
                </View>

                {powered ? (
                  <View className="mt-8 gap-6">
                    <Section>
                      <InfoRow
                        icon="flash"
                        label={t("devices.detail.battery")}
                        value={`${device.batteryLevel}%`}
                      />
                      <InfoRow
                        icon="hardware-chip-outline"
                        label={t("devices.detail.firmware")}
                        value={device.firmwareVersion}
                      />
                    </Section>

                    <Section title={t("devices.detail.style")}>
                      <View className="rounded-xl border border-border bg-surfaceAlt p-5">
                        <AppText variant="body" tone="muted" className="text-center">
                          {t("devices.detail.styleSoon")}
                        </AppText>
                      </View>
                    </Section>
                  </View>
                ) : (
                  <View className="mt-10 items-center gap-2 px-6">
                    <AppText variant="title" className="text-center">
                      {t("devices.detail.offTitle")}
                    </AppText>
                    <AppText variant="body" tone="muted" className="text-center">
                      {t("devices.detail.offBody")}
                    </AppText>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      </SurfaceProvider>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Icon>["name"];
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center justify-between rounded-xl border border-border bg-surface px-4 py-4">
      <View className="flex-row items-center gap-3">
        <Icon name={icon} tone="muted" />
        <AppText variant="body">{label}</AppText>
      </View>
      {value ? (
        <AppText variant="body" tone="muted">
          {value}
        </AppText>
      ) : null}
    </View>
  );
}
