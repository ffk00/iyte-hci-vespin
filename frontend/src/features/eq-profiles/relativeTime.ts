/**
 * Human "last used" labels for personal tones — "Used just now",
 * "Used yesterday", "Used 4 days ago". Demo-grade, day-granular.
 */
export function usedLabel(lastUsedAt: string | null): string {
  if (!lastUsedAt) return "Never used";

  const then = new Date(lastUsedAt).getTime();
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);

  if (minutes < 1) return "Used 1 s ago";
  if (hours < 1) return `Used ${minutes} min ago`;
  if (days < 1) return "Used today";
  if (days === 1) return "Used yesterday";
  return `Used ${days} days ago`;
}
