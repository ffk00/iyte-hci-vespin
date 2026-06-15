import { Image, View, type ImageSourcePropType } from "react-native";
import { STAND_IMAGE } from "../catalog";

type Props = {
  /** Speakers resting on the disc. Empty = bare turntable (empty state). */
  speakers?: ImageSourcePropType[];
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
 * drawn first so the speakers paint *on top* of the disc. Multiple speakers fan
 * across the disc surface, overlapping slightly with front-to-back depth via
 * z-order (the first/focused speaker is frontmost).
 */
export function SpeakerStage({ speakers = [], dimmed, height = 232 }: Props) {
  const count = speakers.length;
  const size = speakerSizeFor(count);

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
          {speakers.map((image, i) => (
            <View
              key={i}
              style={{
                marginLeft: i === 0 ? 0 : -size * 0.28,
                zIndex: count - i,
                elevation: count - i,
              }}
            >
              <Image
                source={image}
                resizeMode="contain"
                style={{ width: size, height: size, opacity: dimmed ? 0.4 : 1 }}
              />
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
