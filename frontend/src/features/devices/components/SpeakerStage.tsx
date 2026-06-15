import { Image, Pressable, View, type ImageSourcePropType } from "react-native";
import { STAND_IMAGE } from "../catalog";

export type StageSpeaker = { id: string; image: ImageSourcePropType };

type Props = {
  /** Speakers resting on the disc. Empty = bare turntable (empty state). */
  speakers?: StageSpeaker[];
  /** The selected speaker — pulled to the centre, frontmost and emphasized. */
  focusedId?: string | null;
  /** Tap handler per speaker. Omit to render a non-interactive display. */
  onSelect?: (id: string) => void;
  /** Accessibility label for a speaker (typically its name). */
  labelFor?: (id: string) => string;
  /** Dim the speakers (used while a scan is in progress, or when powered off). */
  dimmed?: boolean;
  /** Overall stage height in px. */
  height?: number;
};

const STAND_WIDTH = 300;
const STAND_HEIGHT = 140;

function speakerSizeFor(count: number): number {
  if (count <= 1) return 196;
  if (count === 2) return 150;
  return 120;
}

/**
 * The black turntable with any number of speakers resting on it. The stand is
 * drawn first so the speakers paint *on top* of the disc. The focused speaker
 * is arranged dead-centre, frontmost and slightly larger; the rest fan out
 * behind it to either side. When `onSelect` is provided each speaker is its own
 * tap target — tapping a back speaker selects it, which the parent turns into
 * "bring to front" (and a second tap on the focused one opens its page).
 */
export function SpeakerStage({
  speakers = [],
  focusedId,
  onSelect,
  labelFor,
  dimmed,
  height = 232,
}: Props) {
  const count = speakers.length;
  const size = speakerSizeFor(count);
  // Loosen the overlap once it's crowded so every speaker stays tappable.
  const overlap = count >= 3 ? 0.18 : 0.28;

  // Re-order for display: the focused speaker in the middle, others flanking it.
  const focusedIdx = Math.max(
    0,
    speakers.findIndex((s) => s.id === focusedId),
  );
  const others = speakers.filter((_, i) => i !== focusedIdx);
  const half = Math.floor(others.length / 2);
  const focusedSpeaker = speakers[focusedIdx];
  const order = focusedSpeaker
    ? [...others.slice(0, half), focusedSpeaker, ...others.slice(half)]
    : [];
  const focusedPos = half;

  return (
    <View className="w-full items-center justify-end" style={{ height }}>
      <Image
        source={STAND_IMAGE}
        resizeMode="contain"
        accessibilityRole="image"
        style={{ width: STAND_WIDTH, height: STAND_HEIGHT, position: "absolute", bottom: 0 }}
      />

      {count > 0 ? (
        <View
          className="absolute flex-row items-end justify-center"
          style={{ bottom: STAND_HEIGHT * 0.46 }}
        >
          {order.map((s, i) => {
            const isFocused = i === focusedPos;
            // Frontmost in the centre, falling away to the sides.
            const z = order.length - Math.abs(i - focusedPos);
            const scale = count > 1 ? (isFocused ? 1.08 : 0.95) : 1;
            const image = (
              <Image
                source={s.image}
                resizeMode="contain"
                style={{
                  width: size,
                  height: size,
                  opacity: dimmed ? 0.4 : 1,
                  transform: [{ scale }],
                }}
              />
            );
            return (
              <View
                key={s.id}
                style={{
                  marginLeft: i === 0 ? 0 : -size * overlap,
                  zIndex: z,
                  elevation: z,
                }}
              >
                {onSelect ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isFocused }}
                    accessibilityLabel={labelFor?.(s.id)}
                    onPress={() => onSelect(s.id)}
                    hitSlop={8}
                  >
                    {image}
                  </Pressable>
                ) : (
                  image
                )}
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
