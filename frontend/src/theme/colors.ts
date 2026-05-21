export const primitive = {
  brand: {
    maroon: {
      50: "#F2D9DE",
      500: "#6A1322",
      700: "#460812",
      900: "#2A050B",
    },
    cream: {
      50: "#F5EFE3",
      100: "#EFE9DE",
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
  background: primitive.brand.cream[100],
  surface: primitive.brand.cream[50],
  surfaceAlt: primitive.brand.cream[200],
  primary: primitive.brand.maroon[700],
  primaryDeep: primitive.brand.maroon[900],
  onPrimary: primitive.brand.cream[50],
  ink: primitive.neutral[900],
  muted: primitive.neutral[500],
  border: primitive.neutral[300],
  danger: primitive.status.danger,
  success: primitive.status.success,
} as const;

export const colors = semantic;

export type ColorToken = keyof typeof semantic;
