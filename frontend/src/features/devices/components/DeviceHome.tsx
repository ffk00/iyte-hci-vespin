import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, View, type ImageSourcePropType } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { BottomSheet } from "@/components/layout/BottomSheet";
import { LoadingRing } from "@/components/feedback/LoadingRing";
import { SurfaceProvider } from "@/providers/SurfaceProvider";
import { useTranslation } from "@/providers/I18nProvider";
import {
  gradientLocations,
  primitive,
  speakerGradient,
  type SpeakerGradientKey,
} from "@/theme/colors";
import { speakerForType, type DeviceType, type SpeakerModel } from "../catalog";
import { useDevices } from "../hooks/useDevices";
import { SCAN_DURATION_MS, type PairResult } from "../simulatePairing";
import { useDevicePower, useDevicesStore } from "../store";
import { DiscoveryList } from "./DiscoveryList";
import { ResultSheet } from "./ResultSheet";
import { ReviewPanel } from "./ReviewPanel";
import { SpeakerStage } from "./SpeakerStage";

const POWER_ON = require("../../../../assets/power-on-button.png");
const POWER_OFF = require("../../../../assets/power-off-button.png");

const CREAM = primitive.brand.cream[50];

type Step = "idle" | "scanning" | "discovery" | "naming";

/**
 * The whole device experience lives on this single Home screen. The stand is a
 * constant backdrop; pairing happens in-place — the spinner runs here, the
 * found speaker is picked/named in bottom sheets layered over Home (the tab bar
 * stays visible), and connected speakers stand together on the one stand. The
 * background is a soft gradient tinted to the focused speaker's color.
 *
 * Per the demo brief this flow is entirely local: nothing is sent to the
 * backend, and the success/fail outcome is scripted (see `simulatePairing`).
 */
export function DeviceHome() {
  const { t } = useTranslation();
  const devices = useDevices();
  const addDevice = useDevicesStore((s) => s.addDevice);
  const recordAttempt = useDevicesStore((s) => s.recordAttempt);

  const [step, setStep] = useState<Step>("idle");
  const [selected, setSelected] = useState<SpeakerModel | null>(null);
  const [result, setResult] = useState<PairResult | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    if (step !== "scanning") return;
    const id = setTimeout(() => setStep("discovery"), SCAN_DURATION_MS);
    return () => clearTimeout(id);
  }, [step]);

  const focused = devices.length
    ? devices[Math.min(focusedIndex, devices.length - 1)]
    : null;
  const power = useDevicePower(focused?.id ?? "__none__");

  const startScan = () => {
    setSelected(null);
    setStep("scanning");
  };

  const connectFromDiscovery = () => {
    if (selected) setStep("naming");
  };

  const confirm = (name: string) => {
    const outcome = recordAttempt();
    if (outcome === "success" && selected) {
      addDevice({ name, deviceType: selected.deviceType });
    }
    setResult(outcome);
  };

  const handleResultDone = () => {
    setResult(null);
    setSelected(null);
    setFocusedIndex(0);
    setStep("idle");
  };

  // The speaker that tints the background and stands on the disc right now.
  const activeType: DeviceType | null =
    step === "discovery" || step === "naming"
      ? (selected?.deviceType ?? null)
      : (focused?.deviceType ?? null);

  const standSpeakers: ImageSourcePropType[] =
    step === "discovery" || step === "naming"
      ? selected
        ? [selected.image]
        : []
      : step === "scanning"
        ? []
        : devices
            .map((d) => speakerForType(d.deviceType)?.image)
            .filter((img): img is ImageSourcePropType => Boolean(img));

  const gradientColors =
    activeType !== null
      ? speakerGradient[activeType as SpeakerGradientKey]
      : ([CREAM, CREAM] as const);

  const showSheet = result === null && (step === "discovery" || step === "naming");

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
            <Header onAdd={startScan} addDisabled={step !== "idle"} />

            <View className="flex-1 items-center justify-between py-6">
              <TopSlot
                step={step}
                hasDevices={devices.length > 0}
                powered={power.powered}
                batteryLevel={focused?.batteryLevel ?? 0}
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("devices.home.openLabel")}
                disabled={step !== "idle" || !focused || !power.powered}
                onPress={() => focused && router.push(`/(app)/devices/${focused.id}`)}
              >
                <SpeakerStage speakers={standSpeakers} dimmed={step === "scanning"} />
              </Pressable>

              {step === "idle" ? (
                devices.length === 0 ? (
                  <EmptyFooter />
                ) : (
                  <ConnectedFooter
                    name={focused?.name ?? ""}
                    powered={power.powered}
                    onTogglePower={power.toggle}
                    count={devices.length}
                    focusedIndex={Math.min(focusedIndex, devices.length - 1)}
                    onFocus={setFocusedIndex}
                  />
                )
              ) : (
                <View className="h-2" />
              )}
            </View>
          </View>

          {showSheet && step === "discovery" ? (
            <BottomSheet tone="primary">
              <DiscoveryList
                selected={selected}
                onSelect={setSelected}
                onConnect={connectFromDiscovery}
                onCancel={() => setStep("idle")}
              />
            </BottomSheet>
          ) : null}

          {showSheet && step === "naming" && selected ? (
            <BottomSheet tone="primary">
              <ReviewPanel
                selected={selected}
                existingNames={devices.map((d) => d.name)}
                onConfirm={confirm}
                onBack={() => setStep("discovery")}
              />
            </BottomSheet>
          ) : null}

          {result ? <ResultSheet result={result} onDone={handleResultDone} /> : null}
        </SafeAreaView>
      </SurfaceProvider>
    </View>
  );
}

function Header({ onAdd, addDisabled }: { onAdd: () => void; addDisabled: boolean }) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center justify-between py-2">
      <IconButton
        name="information-circle-outline"
        accessibilityLabel={t("devices.home.infoLabel")}
        tone="muted"
      />
      <AppText variant="display" tone="brand" className="text-[22px]">
        {t("devices.home.title")}
      </AppText>
      <IconButton
        name="add"
        accessibilityLabel={t("devices.home.addLabel")}
        onPress={onAdd}
        disabled={addDisabled}
      />
    </View>
  );
}

function TopSlot({
  step,
  hasDevices,
  powered,
  batteryLevel,
}: {
  step: Step;
  hasDevices: boolean;
  powered: boolean;
  batteryLevel: number;
}) {
  const { t } = useTranslation();

  if (step === "scanning") {
    return (
      <View className="items-center gap-5 pt-4">
        <AppText variant="title">{t("devices.discover.finding")}</AppText>
        <LoadingRing size={84} />
      </View>
    );
  }

  if (step === "idle" && !hasDevices) {
    return (
      <View className="w-full flex-row items-start justify-center gap-3 pt-2">
        <AppText variant="display" tone="muted" className="text-5xl">
          +
        </AppText>
        <View className="max-w-[180px] rounded-xl bg-surfaceAlt px-4 py-3">
          <AppText variant="caption" tone="muted">
            {t("devices.home.hint")}
          </AppText>
        </View>
      </View>
    );
  }

  if (step === "idle") {
    return (
      <View className="h-9 flex-row items-center gap-2">
        {powered ? (
          <>
            <Icon name="flash" tone="success" />
            <AppText variant="title" tone="success">
              {batteryLevel}%
            </AppText>
          </>
        ) : null}
      </View>
    );
  }

  return <View className="h-9" />;
}

function EmptyFooter() {
  const { t } = useTranslation();
  return (
    <View className="items-center gap-2">
      <Image source={POWER_OFF} resizeMode="contain" className="h-14 w-14" />
      <AppText variant="display" tone="brand" className="text-center text-2xl">
        {t("devices.home.noName")}
      </AppText>
      <AppText variant="body" tone="muted">
        {t("devices.home.noProducts")}
      </AppText>
    </View>
  );
}

function ConnectedFooter({
  name,
  powered,
  onTogglePower,
  count,
  focusedIndex,
  onFocus,
}: {
  name: string;
  powered: boolean;
  onTogglePower: () => void;
  count: number;
  focusedIndex: number;
  onFocus: (index: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="items-center gap-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("devices.home.powerLabel")}
        onPress={onTogglePower}
        hitSlop={12}
      >
        <Image source={powered ? POWER_ON : POWER_OFF} resizeMode="contain" className="h-14 w-14" />
      </Pressable>
      <AppText variant="body" tone="muted">
        {powered ? t("devices.home.connected") : t("devices.home.standby")}
      </AppText>
      <AppText variant="display" tone="brand" className="text-center text-2xl">
        {name}
      </AppText>

      {count > 1 ? (
        <View className="mt-1 flex-row gap-2">
          {Array.from({ length: count }).map((_, i) => (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={`${i + 1}`}
              hitSlop={8}
              onPress={() => onFocus(i)}
              className={`h-2 w-2 rounded-pill ${i === focusedIndex ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
