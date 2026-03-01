/**
 * Format a number as Turkish Lira (₺).
 * Uses tr-TR locale for proper formatting.
 *
 * @example formatCurrency(99)    → "₺99,00"
 * @example formatCurrency(299.5) → "₺299,50"
 */
export function formatCurrency(amount: number, currency = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
