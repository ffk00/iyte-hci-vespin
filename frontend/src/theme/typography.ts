export const fontFamily = {
  display: ["ZenDots"],
  body: ["System"],
} as const;

export const fontSize = {
  caption: ["13px", { lineHeight: "18px" }],
  body: ["16px", { lineHeight: "24px" }],
  title: ["20px", { lineHeight: "28px" }],
  headline: ["32px", { lineHeight: "36px" }],
  display: ["40px", { lineHeight: "44px" }],
} as const;

export const typeScale = {
  display: { size: 40, lineHeight: 44, weight: "400", family: "display" },
  // Marketing heading in the platform face — distinct from the ZenDots wordmark.
  headline: { size: 32, lineHeight: 36, weight: "700", family: "body" },
  button: { size: 16, lineHeight: 20, weight: "400", family: "display" },
  title: { size: 20, lineHeight: 28, weight: "600", family: "body" },
  body: { size: 16, lineHeight: 24, weight: "400", family: "body" },
  caption: { size: 13, lineHeight: 18, weight: "400", family: "body" },
} as const;

export type TypeVariant = keyof typeof typeScale;
