import { useState } from "react";
import { router } from "expo-router";
import { Image, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { AppText } from "@/components/ui/AppText";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { SurfaceProvider } from "@/providers/SurfaceProvider";
import { useTranslation } from "@/providers/I18nProvider";
import {
  gradientLocations,
  primitive,
  speakerGradient,
  type SpeakerGradientKey,
} from "@/theme/colors";
import { speakerForType, STYLE_IMAGES } from "../catalog";
import { useDevices } from "../hooks/useDevices";
import { useDevicePower } from "../store";
import { SpeakerStage } from "./SpeakerStage";

const CREAM = primitive.brand.cream[50];

/** EQ-style presets shown under the player. Cosmetic — no audio engine. */
const PRESETS = ["none", "jazz", "rock", "demo", "bass"] as const;
type Preset = (typeof PRESETS)[number];

type Props = {
  deviceId: string;
};

/**
 * The selected speaker. Mirrors the reference: the speaker on its stand up top,
 * then "Choose your style" (a tappable artwork that cycles) and "Choose your
 * music" (a cosmetic player with EQ-preset chips). Nothing here drives real
 * audio — the hardware is fully simulated.
 */
export function DeviceDetail({ deviceId }: Props) {
  const { t } = useTranslation();
  const devices = useDevices();
  const device = devices.find((d) => d.id === deviceId);
  const { powered } = useDevicePower(deviceId);

  const model = device ? speakerForType(device.deviceType) : undefined;
  const [styleIndex, setStyleIndex] = useState(0);
  const [preset, setPreset] = useState<Preset>("none");
  const [playing, setPlaying] = useState(false);

  const gradientColors =
    device && powered
      ? speakerGradient[device.deviceType as SpeakerGradientKey]
      : ([CREAM, CREAM] as const);

  const cycleStyle = () => setStyleIndex((i) => (i + 1) % STYLE_IMAGES.length);

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
                <SpeakerStage
                  speakers={model ? [{ id: device.id, image: model.image }] : []}
                  dimmed={!powered}
                />

                <AppText variant="display" tone="brand" className="mt-1 text-center text-2xl">
                  {device.name}
                </AppText>

                {powered ? (
                  <View className="mt-8 gap-7">
                    <View className="gap-3">
                      <AppText variant="display" tone="brand" className="text-xl">
                        {t("devices.detail.style")}
                      </AppText>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t("devices.detail.styleLabel")}
                        onPress={cycleStyle}
                        className="h-40 items-center justify-center rounded-2xl border border-border bg-surfaceAlt active:opacity-80"
                      >
                        <Image
                          source={STYLE_IMAGES[styleIndex]}
                          resizeMode="contain"
                          className="h-24 w-28"
                        />
                      </Pressable>
                    </View>

                    <View className="gap-3">
                      <AppText variant="display" tone="brandMuted" className="text-xl">
                        {t("devices.detail.music")}
                      </AppText>
                      <MusicPlayer
                        playing={playing}
                        onTogglePlay={() => setPlaying((p) => !p)}
                        preset={preset}
                        onSelectPreset={setPreset}
                      />
                    </View>
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

function MusicPlayer({
  playing,
  onTogglePlay,
  preset,
  onSelectPreset,
}: {
  playing: boolean;
  onTogglePlay: () => void;
  preset: Preset;
  onSelectPreset: (preset: Preset) => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="gap-5 rounded-2xl border border-border bg-surfaceAlt p-5">
      <View className="items-center gap-1">
        <AppText variant="title" tone="brand">
          {t("devices.detail.trackArtist")}
        </AppText>
        <AppText variant="title" tone="brand">
          {t("devices.detail.trackTitle")}
        </AppText>
      </View>

      {/* Cosmetic scrubber — static playhead at ~35%. */}
      <View className="gap-1.5">
        <View className="h-1.5 flex-row items-center rounded-pill bg-primaryMuted/25">
          <View className="h-1.5 w-[35%] rounded-pill bg-primary" />
          <View className="-ml-1.5 h-3.5 w-3.5 rounded-pill bg-primary" />
        </View>
        <AppText variant="caption" tone="muted">
          1:22
        </AppText>
      </View>

      <View className="flex-row items-center justify-center gap-10">
        <Pressable accessibilityRole="button" accessibilityLabel={t("devices.detail.prev")} hitSlop={12}>
          <Icon name="play-skip-back" size="lg" tone="brand" />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={playing ? t("devices.detail.pause") : t("devices.detail.play")}
          onPress={onTogglePlay}
          hitSlop={12}
          className="h-16 w-16 items-center justify-center rounded-pill border-2 border-primary"
        >
          <Icon name={playing ? "pause" : "play"} size="lg" tone="brand" />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={t("devices.detail.next")} hitSlop={12}>
          <Icon name="play-skip-forward" size="lg" tone="brand" />
        </Pressable>
      </View>

      <View className="flex-row flex-wrap justify-center gap-2">
        {PRESETS.map((p) => {
          const active = p === preset;
          return (
            <Pressable
              key={p}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onSelectPreset(p)}
              className={`rounded-pill px-4 py-2 ${
                active ? "bg-primary" : "border border-border bg-surface"
              }`}
            >
              <AppText variant="caption" tone={active ? "onPrimary" : "brand"}>
                {t(`devices.detail.presets.${p}`)}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
