import { type ReactNode } from "react";
import { Pressable, type PressableProps } from "react-native";

type Props = Omit<PressableProps, "children" | "accessibilityLabel"> & {
  accessibilityLabel: string;
  children: ReactNode;
  className?: string;
};

// Circular provider button for the "continue with" row. The logo itself is
// passed as children (an <Icon /> or a brand <Image />) so this stays agnostic
// to icon source. 56pt diameter clears the 44pt minimum hit area.
export function SocialButton({ accessibilityLabel, children, className, ...rest }: Props) {
  const cls = [
    "h-14 w-14 items-center justify-center rounded-pill bg-surface border border-border",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={cls}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
