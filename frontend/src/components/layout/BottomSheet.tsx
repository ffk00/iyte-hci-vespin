import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Easing, View } from "react-native";
import { SurfaceProvider, type SurfaceTone } from "@/providers/SurfaceProvider";

export type SheetTone = "primary" | "notif";

const TONE_BG: Record<SheetTone, string> = {
  primary: "bg-primary",
  notif: "bg-notifSurface",
};

// What text/icon defaults the sheet contents inherit.
const TONE_SURFACE: Record<SheetTone, SurfaceTone> = {
  primary: "primary",
  notif: "default",
};

type Props = {
  tone: SheetTone;
  children: ReactNode;
};

/**
 * A bottom-anchored sheet rendered *inside* the current screen (an absolutely
 * positioned View, not a native Modal), so the tab bar stays visible beneath
 * it — matching the pairing mockups. Slides up on mount.
 */
export function BottomSheet({ tone, children }: Props) {
  const translateY = useRef(new Animated.Value(48)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <View className="absolute inset-0 justify-end" pointerEvents="box-none">
      <Animated.View
        style={{ transform: [{ translateY }], opacity }}
        className={`rounded-t-xl px-6 pb-8 pt-6 ${TONE_BG[tone]}`}
      >
        <SurfaceProvider tone={TONE_SURFACE[tone]}>{children}</SurfaceProvider>
      </Animated.View>
    </View>
  );
}
