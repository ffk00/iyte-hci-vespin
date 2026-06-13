import {
  type ComponentProps,
  type ComponentType,
  useEffect,
  useRef,
} from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { Tabs } from "expo-router";
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EqPictogram } from "@/components/ui/EqPictogram";
import { HomePictogram } from "@/components/ui/HomePictogram";
import { SettingsPictogram } from "@/components/ui/SettingsPictogram";
import { SurfaceProvider } from "@/providers/SurfaceProvider";
import { colors } from "@/theme/colors";

/**
 * The props a custom tab bar receives. expo-router does not re-export
 * `BottomTabBarProps`, and the underlying `@react-navigation/bottom-tabs` is a
 * transitive dependency that pnpm does not hoist, so it cannot be imported
 * directly. Derive the type from the `tabBar` slot of expo-router's own `Tabs`.
 */
type BottomTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

type RouteIcon = {
  Pictogram: ComponentType<{ size?: number }>;
  size: number;
};

const ROUTE_ICON: Record<string, RouteIcon> = {
  devices: {
    Pictogram: HomePictogram,
    size: 34,
  },
  eq: {
    Pictogram: EqPictogram,
    size: 28,
  },
  settings: {
    Pictogram: SettingsPictogram,
    size: 28,
  },
};

const ROW_HEIGHT = 56;

const PILL_WIDTH = 64;
const PILL_HEIGHT = 44;
const PILL_RADIUS = 16;

// Large enough to fill the pill from its center.
const RIPPLE_RADIUS = 40;

/**
 * Selection choreography:
 *
 * 1. Base-colored pill appears.
 * 2. Base color remains visible briefly.
 * 3. Active color blooms outward from the center.
 */
const PILL_ENTER_DURATION_MS = 90;
const BASE_COLOR_HOLD_MS = 70;
const BLOOM_DELAY_MS =
  PILL_ENTER_DURATION_MS + BASE_COLOR_HOLD_MS;
const BLOOM_DURATION_MS = 250;

const PILL_EXIT_DELAY_MS = 20;
const PILL_EXIT_DURATION_MS = 120;
const RIPPLE_EXIT_DURATION_MS = 90;

const PRESS_IN_DURATION_MS = 70;
const PRESS_OUT_DURATION_MS = 120;

type TabItemProps = {
  focused: boolean;
  meta: RouteIcon;
  accessibilityLabel: string;
  testID?: string;
  onPress: () => void;
  onLongPress: () => void;
};

function TabItem({
  focused,
  meta,
  accessibilityLabel,
  testID,
  onPress,
  onLongPress,
}: TabItemProps) {
  const reduceMotion = useReducedMotion();
  const hasMounted = useRef(false);

  // Controls pill visibility, pill scale, and icon selection treatment.
  const selectionProgress = useSharedValue(focused ? 1 : 0);

  // Controls only the center-out active-color bloom.
  const rippleProgress = useSharedValue(focused ? 1 : 0);

  // Separate press feedback so pressing does not disturb selection state.
  const pressProgress = useSharedValue(0);

  useEffect(() => {
    /**
     * Do not replay the animation on initial mount.
     *
     * The initially selected tab should render directly in its completed,
     * resting state.
     */
    if (!hasMounted.current) {
      hasMounted.current = true;
      selectionProgress.value = focused ? 1 : 0;
      rippleProgress.value = focused ? 1 : 0;
      return;
    }

    cancelAnimation(selectionProgress);
    cancelAnimation(rippleProgress);

    if (reduceMotion) {
      selectionProgress.value = focused ? 1 : 0;
      rippleProgress.value = focused ? 1 : 0;
      return;
    }

    if (focused) {
      /**
       * First reveal the base-colored pill.
       */
      selectionProgress.value = withTiming(1, {
        duration: PILL_ENTER_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      });

      /**
       * Collapse the active-color layer, visibly hold the base color,
       * then bloom the active color from the center.
       */
      rippleProgress.value = withSequence(
        withTiming(0, {
          duration: 0,
        }),
        withDelay(
          BLOOM_DELAY_MS,
          withTiming(1, {
            duration: BLOOM_DURATION_MS,
            easing: Easing.out(Easing.cubic),
          }),
        ),
      );

      return;
    }

    /**
     * Remove the active-color bloom slightly before the base pill exits.
     * This makes deselection feel clean instead of blinking away as one layer.
     */
    rippleProgress.value = withTiming(0, {
      duration: RIPPLE_EXIT_DURATION_MS,
      easing: Easing.out(Easing.quad),
    });

    selectionProgress.value = withDelay(
      PILL_EXIT_DELAY_MS,
      withTiming(0, {
        duration: PILL_EXIT_DURATION_MS,
        easing: Easing.out(Easing.quad),
      }),
    );
  }, [
    focused,
    reduceMotion,
    rippleProgress,
    selectionProgress,
  ]);

  const pillStyle = useAnimatedStyle(() => {
    const progress = Math.max(
      0,
      Math.min(1, selectionProgress.value),
    );

    return {
      opacity: progress,
      transform: [
        {
          scale: interpolate(
            progress,
            [0, 1],
            [0.82, 1],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const rippleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          /**
           * Avoid an exact scale of zero because extremely small positive
           * scales tend to behave more consistently across renderers.
           */
          scale: interpolate(
            rippleProgress.value,
            [0, 1],
            [0.001, 1],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    const selection = selectionProgress.value;
    const pressed = pressProgress.value;

    const selectionScale = interpolate(
      selection,
      [0, 1],
      [0.96, 1],
      Extrapolation.CLAMP,
    );

    const pressScale = interpolate(
      pressed,
      [0, 1],
      [1, 0.965],
      Extrapolation.CLAMP,
    );

    return {
      opacity: interpolate(
        selection,
        [0, 1],
        [0.55, 1],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateY: interpolate(
            selection,
            [0, 1],
            [1, 0],
            Extrapolation.CLAMP,
          ),
        },
        {
          scale: selectionScale * pressScale,
        },
      ],
    };
  });

  const animatePress = (pressed: boolean) => {
    cancelAnimation(pressProgress);

    const target = pressed ? 1 : 0;

    if (reduceMotion) {
      pressProgress.value = target;
      return;
    }

    pressProgress.value = withTiming(target, {
      duration: pressed
        ? PRESS_IN_DURATION_MS
        : PRESS_OUT_DURATION_MS,
      easing: Easing.out(Easing.quad),
    });
  };

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{
        selected: focused,
      }}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      hitSlop={8}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => animatePress(true)}
      onPressOut={() => animatePress(false)}
      style={styles.tabItem}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.pill, pillStyle]}
      >
        {/*
          The transformed outer node handles scale.

          The untransformed inner node handles rounded clipping. Keeping
          these responsibilities separate prevents the ripple from escaping
          the pill's rounded corners on some renderers.
        */}
        <View style={styles.pillClip}>
          <Animated.View
            style={[styles.ripple, rippleStyle]}
          />
        </View>
      </Animated.View>

      <Animated.View pointerEvents="none" style={iconStyle}>
        <meta.Pictogram size={meta.size} />
      </Animated.View>
    </Pressable>
  );
}

export function BottomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  /**
   * Determine focus by route key instead of comparing against the index of a
   * filtered route list. This remains correct even if some navigator routes
   * are intentionally omitted from the visible tab bar.
   */
  const activeRouteKey = state.routes[state.index]?.key;

  const visibleRoutes = state.routes.filter(
    (route) => ROUTE_ICON[route.name] !== undefined,
  );

  return (
    <SurfaceProvider tone="primary">
      <View
        style={[
          styles.container,
          {
            paddingBottom: insets.bottom + 8,
          },
        ]}
      >
        <View
          accessibilityRole="tablist"
          style={styles.row}
        >
          {visibleRoutes.map((route) => {
            const meta = ROUTE_ICON[route.name];
            const options = descriptors[route.key]?.options;
            const focused = route.key === activeRouteKey;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!focused && !event.defaultPrevented) {
                navigation.navigate(
                  route.name,
                  route.params,
                );
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            return (
              <TabItem
                key={route.key}
                focused={focused}
                meta={meta}
                accessibilityLabel={
                  options?.tabBarAccessibilityLabel ??
                  options?.title ??
                  route.name
                }
                testID={options?.tabBarButtonTestID}
                onPress={onPress}
                onLongPress={onLongPress}
              />
            );
          })}
        </View>
      </View>
    </SurfaceProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingHorizontal: 16,

    backgroundColor: colors.tabBar,

    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,

    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.edgeHighlight,
  },

  row: {
    height: ROW_HEIGHT,
    flexDirection: "row",
  },

  tabItem: {
    flex: 1,
    height: ROW_HEIGHT,

    alignItems: "center",
    justifyContent: "center",
  },

  pill: {
    position: "absolute",

    width: PILL_WIDTH,
    height: PILL_HEIGHT,
  },

  pillClip: {
    flex: 1,

    overflow: "hidden",
    borderRadius: PILL_RADIUS,

    /**
     * This is the resting/base color that appears before the bloom.
     */
    backgroundColor: colors.tabActiveBase,
  },

  ripple: {
    position: "absolute",

    left: PILL_WIDTH / 2 - RIPPLE_RADIUS,
    top: PILL_HEIGHT / 2 - RIPPLE_RADIUS,

    width: RIPPLE_RADIUS * 2,
    height: RIPPLE_RADIUS * 2,
    borderRadius: RIPPLE_RADIUS,

    /**
     * This is the final active color that blooms over the base.
     */
    backgroundColor: colors.tabActive,
  },
});