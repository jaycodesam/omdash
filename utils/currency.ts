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
