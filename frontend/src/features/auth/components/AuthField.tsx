import { TextInput, View, type TextInputProps } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { colors } from "@/theme/colors";

type Props = TextInputProps & {
  /** Optional leading glyph (person / mail / lock in the mockups). */
  icon?: IconName;
};

/**
 * The pill-bordered text field used across the auth screens (login, sign up,
 * forgot/reset password). A faint maroon border on the cream ground with an
 * optional dusty-maroon leading icon, matching the reference mockups.
 */
export function AuthField({ icon, ...rest }: Props) {
  return (
    <View className="h-14 flex-row items-center gap-3 rounded-2xl border border-primaryMuted/30 bg-background px-4">
      {icon ? <Icon name={icon} size="md" tone="brandMuted" /> : null}
      <TextInput
        placeholderTextColor={colors.primaryMuted}
        className="flex-1 text-base text-ink"
        {...rest}
      />
    </View>
  );
}
