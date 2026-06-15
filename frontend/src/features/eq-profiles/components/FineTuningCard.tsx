import { useState } from "react";
import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { BAND_LABELS } from "../bands";
import { VerticalSlider } from "./VerticalSlider";

const TRACK_HEIGHT = 160;

type Props = {
  bands: number[];
  onChange: (index: number, db: number) => void;
};

/**
 * The "FINE TUNING" panel: a header with the live dB readout over a row of ten
 * vertical faders, each labelled with its frequency. The readout follows the
 * fader currently being dragged and rests at 0.0 dB otherwise, matching the
 * reference design.
 */
export function FineTuningCard({ bands, onChange }: Props) {
  const [activeDb, setActiveDb] = useState<number | null>(null);
  const readout = (activeDb ?? 0).toFixed(1);

  return (
    <View className="rounded-xl border border-[#E2D2CF] bg-surface px-4 pb-3 pt-4">
      <View className="flex-row items-center justify-between">
        <AppText
          variant="caption"
          tone="brandMuted"
          className="font-semibold tracking-[1.5px]"
        >
          FINE TUNING
        </AppText>
        <AppText variant="caption" tone="brandMuted" className="font-semibold">
          {readout} dB
        </AppText>
      </View>

      <View className="mt-5 flex-row">
        {bands.map((db, i) => (
          <View key={BAND_LABELS[i]} className="flex-1 items-center">
            <VerticalSlider
              value={db}
              trackHeight={TRACK_HEIGHT}
              onChange={(next) => onChange(i, next)}
              onActiveChange={setActiveDb}
            />
            <AppText variant="caption" tone="muted" className="mt-2 text-[11px]">
              {BAND_LABELS[i]}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}
