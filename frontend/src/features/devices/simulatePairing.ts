/**
 * Hardware is fully simulated — there is no radio. The "Finding your device..."
 * step is just a timed delay before the discovered catalog is revealed.
 */
export const SCAN_DURATION_MS = 2500;

export type PairResult = "success" | "fail";

/**
 * The fixed presentation script for the demo. The brief locks the outcome
 * order: first add succeeds, the second fails, the third succeeds — and every
 * attempt after that succeeds. The outcome is keyed off the *attempt index*,
 * not the chosen speaker, so the script stays honest even if the presenter taps
 * a different speaker than planned.
 */
const OUTCOME_SCRIPT: readonly PairResult[] = ["success", "fail", "success"];

/** Outcome for the n-th (0-based) completed pairing attempt. */
export function outcomeForAttempt(n: number): PairResult {
  return OUTCOME_SCRIPT[n] ?? "success";
}
