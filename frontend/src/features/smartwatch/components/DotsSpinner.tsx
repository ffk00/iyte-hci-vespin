import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const DOT_COUNT = 12;

type Props = {
  size?: number;
  color?: string;
};

/** The iOS-style ring of fading dots shown while "Searching for nearby devices…". */
export function DotsSpinner({ size = 56, color = "#6A1322" }: Props) {
  const angle = useSharedValue(0);

  useEffect(() => {
    angle.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [angle]);

  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.value}deg` }] }));

  const radius = size / 2;
  const dot = Math.max(4, size * 0.12);

  return (
    <Animated.View style={[{ width: size, height: size }, spin]}>
      {Array.from({ length: DOT_COUNT }).map((_, i) => {
        const a = (i / DOT_COUNT) * 2 * Math.PI;
        return (
          <View
            key={i}
            style={{
              position: "absolute",
              left: radius + (radius - dot / 2) * Math.sin(a) - dot / 2,
              top: radius - (radius - dot / 2) * Math.cos(a) - dot / 2,
              width: dot,
              height: dot,
              borderRadius: dot / 2,
              backgroundColor: color,
              opacity: 0.25 + (0.75 * i) / (DOT_COUNT - 1),
            }}
          />
        );
      })}
    </Animated.View>
  );
}
