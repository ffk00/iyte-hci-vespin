import { SvgXml } from "react-native-svg";
import { EQ_ICON_SVG, type EqIconName } from "./iconData";

// The source SVGs bake one of these brand colors into their fills/strokes.
// To recolor an icon for a given surface we swap any of them for the target.
const SOURCE_COLORS = /#(?:8A5C5E|916567|440812)/gi;

type Props = {
  name: EqIconName;
  size?: number;
  /** Recolor the glyph. Omit to keep the source SVG's own color. */
  color?: string;
};

/**
 * Renders one of the provided EQ glyphs (mode icons + factory-preset icons)
 * from its raw SVG markup. The art is monochrome, so `color` simply replaces
 * the baked brand color — letting the same glyph read as muted-maroon in the
 * picker grid or cream on a filled tile.
 */
export function EqIcon({ name, size = 28, color }: Props) {
  const raw = EQ_ICON_SVG[name];
  const xml = color ? raw.replace(SOURCE_COLORS, color) : raw;
  return <SvgXml xml={xml} width={size} height={size} />;
}

export type { EqIconName };

/** The 3x3 picker grid order, matching the reference layout. */
export const MODE_ICON_ORDER: EqIconName[] = [
  "none",
  "waves",
  "sun",
  "party",
  "dumbbell",
  "moon",
  "firework",
  "flower",
  "rock",
];
