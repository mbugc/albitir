/**
 * Generate a random 4-digit numeric pickup code.
 * @example generatePickupCode() → "4829"
 */
export function generatePickupCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Generate an order number in ORD-XXXX format.
 * Uses timestamp-based sequential numbering.
 */
export function generateOrderNumber(): string {
  const seq = Date.now() % 1000000;
  return `ORD-${seq}`;
}
