import { useEffect } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { colors } from "@/theme/colors";
import { DB_MAX, DB_MIN } from "../bands";

const KNOB_SIZE = 16;
const TRACK_WIDTH = 2;
const HIT_WIDTH = 30; // horizontal touch target around the thin track

type Props = {
  value: number;
  trackHeight: number;
  onChange: (db: number) => void;
  /** Reports the live value while dragging (null when released). */
  onActiveChange?: (db: number | null) => void;
};

/**
 * A single vertical EQ fader. The thin track spans the full height; the knob
 * slides along it and snaps to whole-dB steps. Built on gesture-handler +
 * reanimated since the project has no slider dependency. Drag is reported
 * continuously via `onChange`; `onActiveChange` drives the card's dB readout.
 */
export function VerticalSlider({
  value,
  trackHeight,
  onChange,
  onActiveChange,
}: Props) {
  const usable = trackHeight - KNOB_SIZE;
  const range = DB_MAX - DB_MIN;

  // Knob top-offset in px (0 = top = +max dB).
  const pos = useSharedValue(positionFor(value, usable, range));
  const dragging = useSharedValue(false);
  const startPos = useSharedValue(0);

  // Keep the knob in sync when the value changes from outside (e.g. Reset or
  // loading a different profile) — but never fight an in-progress drag.
  useEffect(() => {
    if (!dragging.value) {
      pos.value = withTiming(positionFor(value, usable, range), {
        duration: 160,
      });
    }
  }, [value, usable, range, pos, dragging]);

  const emit = (db: number) => onChange(db);
  const emitActive = (db: number | null) => onActiveChange?.(db);

  const pan = Gesture.Pan()
    .onBegin(() => {
      dragging.value = true;
      startPos.value = pos.value;
    })
    .onUpdate((e) => {
      const next = clamp(startPos.value + e.translationY, 0, usable);
      pos.value = next;
      runOnJS(emit)(valueFor(next, usable, range));
      runOnJS(emitActive)(valueFor(next, usable, range));
    })
    .onEnd(() => {
      const db = valueFor(pos.value, usable, range);
      pos.value = withTiming(positionFor(db, usable, range), { duration: 120 });
    })
    .onFinalize(() => {
      dragging.value = false;
      runOnJS(emitActive)(null);
    });

  const tap = Gesture.Tap().onEnd((e) => {
    const db = valueFor(clamp(e.y - KNOB_SIZE / 2, 0, usable), usable, range);
    pos.value = withTiming(positionFor(db, usable, range), { duration: 120 });
    runOnJS(emit)(db);
  });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pos.value }],
  }));

  return (
    <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
      <View
        style={{ width: HIT_WIDTH, height: trackHeight }}
        className="items-center"
        accessibilityRole="adjustable"
        accessibilityValue={{ min: DB_MIN, max: DB_MAX, now: value }}
      >
        <View
          style={{
            width: TRACK_WIDTH,
            height: trackHeight,
            borderRadius: TRACK_WIDTH,
            backgroundColor: colors.primaryMuted,
            opacity: 0.45,
          }}
        />
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              width: KNOB_SIZE,
              height: KNOB_SIZE,
              borderRadius: KNOB_SIZE / 2,
              backgroundColor: colors.primary,
            },
            knobStyle,
          ]}
        />
      </View>
    </GestureDetector>
  );
}

function clamp(v: number, lo: number, hi: number): number {
  "worklet";
  return Math.max(lo, Math.min(hi, v));
}

/** dB value -> knob top-offset in px. */
function positionFor(value: number, usable: number, range: number): number {
  "worklet";
  const ratio = (value - DB_MIN) / range; // 0..1, 0 = min
  return (1 - ratio) * usable;
}

/** Knob top-offset in px -> whole-dB value. */
function valueFor(posPx: number, usable: number, range: number): number {
  "worklet";
  const ratio = 1 - posPx / usable; // 0..1
  return Math.round(DB_MIN + ratio * range);
}
