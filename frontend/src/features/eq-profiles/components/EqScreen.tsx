import { View, type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

type Props = ViewProps & {
  edges?: readonly Edge[];
  className?: string;
};

/**
 * Edge-to-edge screen on the EQ background fill (#F4E9E6). Unlike the shared
 * `Screen`, the safe-area insets share the same fill so there's no seam at the
 * notch — the EQ mockups use one flat background.
 */
export function EqScreen({
  edges = ["top", "bottom"],
  className,
  children,
  ...rest
}: Props) {
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-backgroundAlt">
      <View className={["flex-1 px-5", className].filter(Boolean).join(" ")} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}
