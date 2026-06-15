import { Pressable, View } from "react-native";
import { colors } from "@/theme/colors";
import { EqIcon, MODE_ICON_ORDER, type EqIconName } from "../modeIcons";

const CARD_BORDER = "#E2D2CF";

type Props = {
  /** Y offset (within the editor) where the caret should point — the button's bottom. */
  top: number;
  selected: EqIconName;
  onSelect: (name: EqIconName) => void;
  onClose: () => void;
};

/**
 * The mode-icon chooser: a floating popover with an upward caret and a 3x3
 * grid of glyphs, anchored just below the editor's icon button (see EqEditor).
 * Tapping the dimmed backdrop or a glyph closes it.
 */
export function ModeIconPicker({ top, selected, onSelect, onClose }: Props) {
  return (
    <View className="absolute inset-0 z-10" pointerEvents="box-none">
      <Pressable
        className="absolute inset-0"
        accessibilityLabel="Close icon picker"
        onPress={onClose}
      />

      <View
        className="absolute self-center"
        style={{ top: top + 10, left: 24, right: 24 }}
        pointerEvents="box-none"
      >
        {/* Caret pointing up at the button. */}
        <View
          className="absolute self-center"
          style={{
            top: -7,
            width: 14,
            height: 14,
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderLeftWidth: 1,
            borderColor: CARD_BORDER,
            transform: [{ rotate: "45deg" }],
          }}
        />

        <View
          className="rounded-xl border bg-surface p-3"
          style={{ borderColor: CARD_BORDER }}
        >
          <View className="flex-row flex-wrap">
            {MODE_ICON_ORDER.map((name) => {
              const isSelected = name === selected;
              return (
                <Pressable
                  key={name}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${name} icon`}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => onSelect(name)}
                  className="w-1/3 items-center justify-center py-4"
                >
                  <View
                    className={`h-14 w-14 items-center justify-center rounded-lg ${
                      isSelected ? "bg-backgroundAlt" : ""
                    }`}
                  >
                    <EqIcon name={name} size={34} color={colors.primaryMuted} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}
