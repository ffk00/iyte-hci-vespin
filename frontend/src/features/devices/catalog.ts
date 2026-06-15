import type { ImageSourcePropType } from "react-native";

/**
 * The three Vespin Retro variants. There is no backend in this demo, so the
 * device type is a plain local union (not imported from the generated schemas).
 */
export type DeviceType = "vespin_classic" | "vespin_mini" | "vespin_pro";

/**
 * The "discoverable" Vespin Retro line-up. There is no Bluetooth — discovery is
 * theatre, so the set of speakers a scan can find is this static catalog. Each
 * entry carries the render asset and the suggested default name.
 */
export type SpeakerModel = {
  deviceType: DeviceType;
  /** i18n key for the marketing model name (e.g. "Vespin Classic"). */
  modelNameKey: string;
  /** i18n key for the suggested name pre-filled when pairing. */
  defaultNameKey: string;
  image: ImageSourcePropType;
};

export const SPEAKER_CATALOG: readonly SpeakerModel[] = [
  {
    deviceType: "vespin_classic",
    modelNameKey: "devices.models.vespin_classic",
    defaultNameKey: "devices.defaultNames.vespin_classic",
    image: require("../../../assets/speakers/red-speaker.png"),
  },
  {
    deviceType: "vespin_mini",
    modelNameKey: "devices.models.vespin_mini",
    defaultNameKey: "devices.defaultNames.vespin_mini",
    image: require("../../../assets/speakers/yellow-speaker.png"),
  },
  {
    deviceType: "vespin_pro",
    modelNameKey: "devices.models.vespin_pro",
    defaultNameKey: "devices.defaultNames.vespin_pro",
    image: require("../../../assets/speakers/blue-speaker.png"),
  },
];

export const STAND_IMAGE: ImageSourcePropType = require("../../../assets/speakers/speaker-stand.png");

/**
 * The "Choose your style" artwork cycled through on the detail screen. Purely
 * cosmetic — there is no audio engine behind it.
 */
export const STYLE_IMAGES: readonly ImageSourcePropType[] = [
  require("../../../assets/style-picker/style-1.png"),
  require("../../../assets/style-picker/style-2.png"),
  require("../../../assets/style-picker/style-3.png"),
];

export function speakerForType(deviceType: string): SpeakerModel | undefined {
  return SPEAKER_CATALOG.find((model) => model.deviceType === deviceType);
}

/**
 * The speaker a successful pairing produces, by add-order. There is no chooser
 * in the reference flow — the n-th paired speaker is scripted: 1st red Classic
 * ("Living Room"), 2nd yellow Mini ("Bed Room"), 3rd blue Pro, then it cycles.
 */
export function scriptedSpeaker(addIndex: number): SpeakerModel {
  return SPEAKER_CATALOG[addIndex % SPEAKER_CATALOG.length];
}

/**
 * Suggested name for a freshly-paired speaker. Duplicates are allowed, so if the
 * base name is taken we append a counter ("Living Room Speaker 2") to keep the
 * device list visually distinct.
 */
export function uniqueDeviceName(base: string, existing: string[]): string {
  if (!existing.includes(base)) return base;
  let n = 2;
  while (existing.includes(`${base} ${n}`)) n += 1;
  return `${base} ${n}`;
}
