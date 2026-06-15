export const primitive = {
  brand: {
    maroon: {
      50: "#F2D9DE",
      300: "#8C5B61",
      500: "#6A1322",
      700: "#550F12",
      800: "#3A0A12",
      900: "#2A050B",
    },
    cream: {
      50: "#FBF2F1",
      100: "#F4E9E6",
      200: "#E4DCCB",
    },
  },
  neutral: {
    0: "#FFFFFF",
    300: "#B8B0A2",
    500: "#6B6B6B",
    700: "#3A3A3A",
    900: "#0A0A0A",
  },
  status: {
    danger: "#B3261E",
    success: "#2E7D32",
  },
} as const;

export const semantic = {
  background: primitive.brand.cream[50],
  backgroundAlt: primitive.brand.cream[100],
  surface: primitive.brand.cream[50],
  surfaceAlt: primitive.brand.cream[200],
  primary: primitive.brand.maroon[700],
  primaryMuted: primitive.brand.maroon[300],
  primaryDeep: primitive.brand.maroon[900],
  onPrimary: primitive.brand.cream[50],
  // Docked tab bar surface: a touch deeper than `primary` so the bar reads as
  // a distinct ground beneath the cream screen content.
  tabBar: primitive.brand.maroon[800],
  // Selected-tab pill (bloomed/resting): a clean, saturated maroon lift
  // (~oklch(0.38 0.13 14)). Saturated on purpose — a desaturated value here
  // reads as grey "fog" when it blooms rather than a deliberate light-up.
  tabActive: "#7E1F30",
  // The pill's "from" color: a deep, still-saturated maroon (~oklch(0.25 0.11
  // 18)). On tap, `tabActive` blooms over this from the center outward, so the
  // pill visibly brightens in the same hue family — a clean wash, not a haze.
  tabActiveBase: "#4D0E17",
  // Hairline top edge-light on the bar (not the pill) — lifts it off the cream
  // content above. Warm (cream-tinted) white at low opacity.
  edgeHighlight: "rgba(251,242,241,0.10)",
  ink: primitive.neutral[900],
  muted: primitive.neutral[500],
  border: primitive.neutral[300],
  danger: primitive.status.danger,
  success: primitive.status.success,
  // Pairing-result sheet (success/fail). A soft pink ground with a deep-maroon
  // action button, distinct from `primary` — these match the result mockups
  // exactly and aren't reused elsewhere.
  notifSurface: "#F2DADA",
  notifAction: "#73383C",
} as const;

export const colors = semantic;

export type ColorToken = keyof typeof semantic;

/**
 * The Home background gradient, tinted to the *focused* speaker's color and
 * fading to cream at the bottom. These are brand art colors (not semantic
 * tokens) consumed by `expo-linear-gradient`, which can't read NativeWind
 * classes — so they live here as the single source of truth. Red is the
 * supplied value; yellow/blue are derived to sit in the same dusty family as
 * their speaker art.
 */
export const speakerGradient = {
  vespin_classic: ["#DCC0C5", primitive.brand.cream[100]], // red
  vespin_mini: ["#DBD0B2", primitive.brand.cream[100]], // yellow
  vespin_pro: ["#C2CCDC", primitive.brand.cream[100]], // blue
} as const;

/** Gradient stops: a soft tint up top fading to cream by ~a third down. */
export const gradientLocations = [0.3, 1] as const;

export type SpeakerGradientKey = keyof typeof speakerGradient;
