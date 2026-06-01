// Currency metadata + formatting helpers for the poker tracker.

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

// Small curated list covering the user's contexts (online USD, home INR) plus
// a few common ones. Extend freely — nothing depends on this being exhaustive.
export const CURRENCIES: CurrencyInfo[] = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
];

export function currencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code + " ";
}

/**
 * Format a money amount in the given currency. Uses Intl when available and
 * falls back to a symbol + fixed decimals otherwise. `signed` prefixes a "+"
 * for positive values (useful for net profit display).
 */
export function formatMoney(
  amount: number | null | undefined,
  code: string,
  opts: { signed?: boolean; decimals?: number } = {}
): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return "—";
  }
  const { signed = false, decimals = 2 } = opts;
  let body: string;
  try {
    body = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(Math.abs(amount));
  } catch {
    body = `${currencySymbol(code)}${Math.abs(amount).toFixed(decimals)}`;
  }
  const sign = amount < 0 ? "−" : signed ? "+" : "";
  return `${sign}${body}`;
}

/** Format a big-blind count, e.g. "+60.0 BB" / "−12.5 BB". */
export function formatBB(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const sign = value < 0 ? "−" : "+";
  return `${sign}${Math.abs(value).toFixed(1)} BB`;
}
