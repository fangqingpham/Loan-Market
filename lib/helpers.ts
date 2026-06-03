/** Small, dependency-free utility helpers. */

/**
 * Conditionally join class names. A tiny `clsx` substitute so we don't pull
 * in an extra dependency at the foundation stage.
 *
 *   cn("p-2", isActive && "bg-brand-600", undefined) // "p-2 bg-brand-600"
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Format a date as a short, human-readable string (e.g. "Jan 5, 2026"). */
export function formatDate(date: string | number | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

/** Format a number as USD currency (e.g. 5 -> "$5.00"). */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}
