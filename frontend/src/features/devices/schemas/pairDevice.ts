import { z } from "zod";

/**
 * The only real input in the pairing flow is the speaker's name. The error
 * messages are i18n keys, resolved with `t()` at render time (same pattern as
 * the auth forms).
 */
export const pairDeviceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "devices.errors.nameRequired")
    .max(100, "devices.errors.nameTooLong"),
});

export type PairDeviceInput = z.infer<typeof pairDeviceSchema>;
