/**
 * Currency utility functions for handling amounts stored in cents
 * All calculations are accurate to 2 decimal places
 */

/**
 * Converts cents to amount and formats for display
 * @param cents - Amount in cents (e.g., 8999)
 * @returns Formatted string with 2 decimal places (e.g., "89.99")
 */
export function formatCents(cents: number): string {
  // Divide by 100 and fix to 2 decimal places
  return (cents / 100).toFixed(2);
}

/**
 * Converts cents to numeric amount
 * @param cents - Amount in cents (e.g., 8999)
 * @returns Numeric amount (e.g., 89.99)
 */
export function centsToAmount(cents: number): number {
  // Divide by 100 and round to 2 decimal places
  // Using Math.round to avoid floating point errors
  return Math.round(cents) / 100;
}

/**
 * Converts amount to cents for API calls
 * @param amount - Amount in dollars (e.g., 89.99)
 * @returns Amount in cents (e.g., 8999)
 */
export function amountToCents(amount: number): number {
  // Multiply by 100 and round to avoid floating point errors
  return Math.round(amount * 100);
}

/**
 * Formats a numeric amount to 2 decimal places
 * @param amount - Numeric amount (e.g., 89.99)
 * @returns Formatted string (e.g., "89.99")
 */
export function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Calculates percentage of an amount
 * @param amount - Amount in cents
 * @param percentage - Percentage as decimal (e.g., 0.13 for 13%)
 * @returns Amount in cents
 */
export function calculatePercentage(amount: number, percentage: number): number {
  return Math.round(amount * percentage);
}

/**
 * Calculates tax on an amount
 * @param amount - Amount in cents
 * @param taxRate - Tax rate as decimal (e.g., 0.13 for 13%)
 * @returns Tax amount in cents
 */
export function calculateTax(amount: number, taxRate: number = 0.13): number {
  return calculatePercentage(amount, taxRate);
}

/**
 * Calculates total from subtotal and tax
 * @param subtotal - Subtotal in cents
 * @param taxRate - Tax rate as decimal (default: 0.13 for 13%)
 * @returns Total amount in cents
 */
export function calculateTotal(subtotal: number, taxRate: number = 0.13): number {
  const tax = calculateTax(subtotal, taxRate);
  return subtotal + tax;
}

/**
 * Formats currency with thousands separator
 * @param cents - Amount in cents
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted string (e.g., "1,234.56")
 */
export function formatCentsWithSeparator(
  cents: number,
  locale: string = 'en-US'
): string {
  const amount = centsToAmount(cents);
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Order calculation helpers
 */

export interface OrderItem {
  quantity: number;
  unitPrice: number; // in cents
}

export interface BulkDiscountTier {
  threshold: number; // in cents
  rate: number; // as decimal (e.g., 0.15 for 15%)
}

export interface OrderTotals {
  subtotalCents: number;
  discountRate: number;
  discountAmountCents: number;
  subtotalAfterDiscountCents: number;
  taxRate: number;
  taxAmountCents: number;
  shippingCostCents: number;
  finalTotalCents: number;
}

// Business rules - centralized configuration
export const BULK_DISCOUNT_TIERS: BulkDiscountTier[] = [
  { threshold: 200000, rate: 0.15 }, // > $2000 = 15% off
  { threshold: 100000, rate: 0.10 }, // > $1000 = 10% off
  { threshold: 50000, rate: 0.05 },  // > $500 = 5% off
];

export const TAX_RATE = 0.13; // 13%
export const SHIPPING_COST_CENTS = 1000; // $10
export const FREE_SHIPPING_THRESHOLD_CENTS = 10000; // Free over $100

/**
 * Calculates the subtotal from order items
 * @param items - Array of order items
 * @returns Subtotal in cents
 */
export function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => {
    return sum + Math.round(item.quantity * item.unitPrice);
  }, 0);
}

/**
 * Gets the bulk discount rate based on subtotal
 * @param subtotalCents - Subtotal in cents
 * @returns Discount rate as decimal (e.g., 0.15 for 15%)
 */
export function getBulkDiscountRate(subtotalCents: number): number {
  for (const tier of BULK_DISCOUNT_TIERS) {
    if (subtotalCents > tier.threshold) {
      return tier.rate;
    }
  }
  return 0;
}

/**
 * Calculates bulk discount amount
 * @param subtotalCents - Subtotal in cents
 * @returns Discount amount in cents
 */
export function calculateBulkDiscount(subtotalCents: number): number {
  const rate = getBulkDiscountRate(subtotalCents);
  return calculatePercentage(subtotalCents, rate);
}

/**
 * Calculates shipping cost based on subtotal after discount
 * @param subtotalAfterDiscountCents - Subtotal after discount in cents
 * @returns Shipping cost in cents
 */
export function calculateShipping(subtotalAfterDiscountCents: number): number {
  return subtotalAfterDiscountCents > FREE_SHIPPING_THRESHOLD_CENTS
    ? 0
    : SHIPPING_COST_CENTS;
}

/**
 * Calculates complete order totals with all breakdowns
 * @param items - Array of order items
 * @returns Object containing all calculated totals
 */
export function calculateOrderTotals(items: OrderItem[]): OrderTotals {
  // Calculate subtotal
  const subtotalCents = calculateSubtotal(items);

  // Calculate bulk discount
  const discountRate = getBulkDiscountRate(subtotalCents);
  const discountAmountCents = calculateBulkDiscount(subtotalCents);
  const subtotalAfterDiscountCents = subtotalCents - discountAmountCents;

  // Calculate tax on discounted amount
  const taxAmountCents = calculateTax(subtotalAfterDiscountCents, TAX_RATE);

  // Calculate shipping
  const shippingCostCents = calculateShipping(subtotalAfterDiscountCents);

  // Calculate final total
  const finalTotalCents = subtotalAfterDiscountCents + taxAmountCents + shippingCostCents;

  return {
    subtotalCents,
    discountRate,
    discountAmountCents,
    subtotalAfterDiscountCents,
    taxRate: TAX_RATE,
    taxAmountCents,
    shippingCostCents,
    finalTotalCents,
  };
}
