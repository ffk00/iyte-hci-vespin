import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { LoadingRing } from "@/components/feedback/LoadingRing";
import { SurfaceProvider } from "@/providers/SurfaceProvider";
import { useTranslation } from "@/providers/I18nProvider";
import {
  gradientLocations,
  primitive,
  speakerGradient,
  type SpeakerGradientKey,
} from "@/theme/colors";
import {
  scriptedSpeaker,
  speakerForType,
  uniqueDeviceName,
  type DeviceType,
  type SpeakerModel,
} from "../catalog";
import { useDevices } from "../hooks/useDevices";
import { SCAN_DURATION_MS, type PairResult } from "../simulatePairing";
import { useDevicePower, useDevicesStore } from "../store";
import { ResultSheet } from "./ResultSheet";
import { SpeakerStage, type StageSpeaker } from "./SpeakerStage";

const POWER_ON = require("../../../../assets/power-on-button.png");
const POWER_OFF = require("../../../../assets/power-off-button.png");

const CREAM = primitive.brand.cream[50];

type Step = "idle" | "scanning" | "result";

/**
 * The whole device experience lives on this single Home screen. The stand is a
 * constant backdrop; pairing happens in-place — tap +, the spinner runs here,
 * then a success/fail sheet drops over Home (the tab bar stays visible). There
 * is no speaker chooser and no naming form: the reference flow just finds "your
 * device", so on success a scripted speaker is added automatically.
 *
 * Multiple speakers share the one stand. Tapping a speaker brings it to the
 * centre (selecting it — the footer follows); tapping the already-selected
 * speaker opens its page. The background is a soft gradient tinted to the
 * focused speaker's color.
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
  const [candidate, setCandidate] = useState<SpeakerModel | null>(null);
  const [result, setResult] = useState<PairResult | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  // The scan is theatre: after a fixed delay we resolve the scripted outcome,
  // add the speaker on success (and focus it), and drop the result sheet.
  useEffect(() => {
    if (step !== "scanning") return;
    const id = setTimeout(() => {
      const outcome = recordAttempt();
      if (outcome === "success" && candidate) {
        const name = uniqueDeviceName(
          t(candidate.defaultNameKey),
          useDevicesStore.getState().devices.map((d) => d.name),
        );
        const added = addDevice({ name, deviceType: candidate.deviceType });
        setFocusedId(added.id);
      }
      setResult(outcome);
      setStep("result");
    }, SCAN_DURATION_MS);
    return () => clearTimeout(id);
  }, [step, candidate, addDevice, recordAttempt, t]);

  const focused = devices.find((d) => d.id === focusedId) ?? devices[0] ?? null;
  const power = useDevicePower(focused?.id ?? "__none__");

  const startScan = () => {
    setCandidate(scriptedSpeaker(devices.length));
    setStep("scanning");
  };

  const handleResultDone = () => {
    setResult(null);
    setCandidate(null);
    setStep("idle");
  };

  // First tap selects + centres a speaker; tapping the focused one opens it.
  const selectSpeaker = (id: string) => {
    if (id === focused?.id) {
      router.push(`/(app)/devices/${id}`);
    } else {
      setFocusedId(id);
    }
  };

  // The speaker that tints the background right now. While pairing it's the
  // incoming candidate; otherwise the focused speaker on the stand.
  const activeType: DeviceType | null =
    step === "idle" ? (focused?.deviceType ?? null) : (candidate?.deviceType ?? null);

  // Speakers resting on the disc. Empty while scanning (img 33); during the
  // result sheet and at idle it's the real device list — on a successful add
  // the new speaker is already in it (img 34/45), on a fail only the existing
  // ones peek out behind the sheet (img 43).
  const standSpeakers: StageSpeaker[] =
    step === "scanning"
      ? []
      : devices
          .map((d) => {
            const image = speakerForType(d.deviceType)?.image;
            return image ? { id: d.id, image } : null;
          })
          .filter((s): s is StageSpeaker => s !== null);

  const gradientColors =
    activeType !== null
      ? speakerGradient[activeType as SpeakerGradientKey]
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
            <Header onAdd={startScan} addDisabled={step !== "idle"} />

            <View className="flex-1 items-center justify-between py-6">
              <TopSlot
                step={step}
                hasDevices={devices.length > 0}
                powered={power.powered}
                batteryLevel={focused?.batteryLevel ?? 0}
              />

              <SpeakerStage
                speakers={standSpeakers}
                focusedId={focused?.id ?? null}
                onSelect={step === "idle" ? selectSpeaker : undefined}
                labelFor={(id) => devices.find((d) => d.id === id)?.name ?? ""}
                dimmed={step === "scanning"}
              />

              {step === "idle" ? (
                devices.length === 0 ? (
                  <EmptyFooter />
                ) : (
                  <ConnectedFooter
                    name={focused?.name ?? ""}
                    powered={power.powered}
                    onTogglePower={power.toggle}
                  />
                )
              ) : (
                <View className="h-2" />
              )}
            </View>
          </View>

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

  // During the result sheet the incoming speaker reads as fully charged.
  if (step === "result") {
    return (
      <View className="h-9 flex-row items-center gap-2">
        <Icon name="flash" tone="success" />
        <AppText variant="title" tone="success">
          100%
        </AppText>
      </View>
    );
  }

  if (!hasDevices) {
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
}: {
  name: string;
  powered: boolean;
  onTogglePower: () => void;
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
    </View>
  );
}
