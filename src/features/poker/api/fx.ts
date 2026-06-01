// Suggests a native→base FX rate at log time. The result is only a suggestion:
// it is stored on the session and always editable, so historical totals never
// move when live rates change. Network/parse failures return null and the UI
// falls back to the last-used rate (or 1) — logging is never blocked.

const ENDPOINT = "https://open.er-api.com/v6/latest";

const cache = new Map<string, { rate: number; at: number }>();
const TTL_MS = 1000 * 60 * 60; // 1 hour

export async function fetchSuggestedRate(
  from: string,
  to: string
): Promise<number | null> {
  if (!from || !to) return null;
  if (from === to) return 1;

  const key = `${from}->${to}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.rate;

  try {
    const res = await fetch(`${ENDPOINT}/${encodeURIComponent(from)}`);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      result?: string;
      rates?: Record<string, number>;
    };
    const rate = json?.rates?.[to];
    if (typeof rate !== "number" || !Number.isFinite(rate)) return null;
    cache.set(key, { rate, at: Date.now() });
    return rate;
  } catch {
    return null;
  }
}
