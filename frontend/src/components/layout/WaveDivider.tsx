import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { semantic } from "@/theme/colors";

type Props = {
  /** Fill for the lower region. Defaults to the redder cream surface. */
  color?: string;
  className?: string;
};

// A soft S-curve that splits a screen into two tonal zones. Authored in a
// 0..100 viewBox and stretched to fill via preserveAspectRatio="none", so the
// curve scales with the container on any device. Purely decorative — it never
// intercepts touches.
export function WaveDivider({ color = semantic.backgroundAlt, className }: Props) {
  return (
    <View className={className} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Path d="M0 14 C28 4 60 24 100 10 L100 100 L0 100 Z" fill={color} />
      </Svg>
    </View>
  );
}
