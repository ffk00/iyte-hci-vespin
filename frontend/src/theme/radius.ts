export const borderRadius = {
  none: "0px",
  sm: "6px",
  md: "10px",
  lg: "16px",
  xl: "24px",
  pill: "9999px",
} as const;

export type RadiusToken = keyof typeof borderRadius;
