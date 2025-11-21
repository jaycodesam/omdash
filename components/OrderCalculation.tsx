import { useState } from 'react';
import { Card } from './ui';
import {
  formatCents,
  calculateOrderTotals,
  BULK_DISCOUNT_TIERS,
  FREE_SHIPPING_THRESHOLD_CENTS,
  centsToAmount,
} from '@/utils/currency';

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number; // in cents
}

interface OrderCalculationProps {
  items: OrderItem[];
}

export function OrderCalculation({ items }: OrderCalculationProps) {
  const [showLegend, setShowLegend] = useState(false);

  // Calculate all order totals using the centralized helper
  const totals = calculateOrderTotals(items);

  return (
    <Card>
      <h3 className="text-lg font-semibold text-foreground mb-4">Order Summary</h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-border-light">
          <span className="text-sm text-gray-600">Subtotal</span>
          <span className="text-sm font-medium text-foreground">${formatCents(totals.subtotalCents)}</span>
        </div>

        {totals.discountRate > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-border-light">
            <span className="text-sm text-gray-600">
              Bulk Discount ({(totals.discountRate * 100).toFixed(0)}%)
              <span className="block text-xs text-gray-400">
                {totals.discountRate === 0.15 && 'Subtotal > $2,000'}
                {totals.discountRate === 0.10 && 'Subtotal > $1,000'}
                {totals.discountRate === 0.05 && 'Subtotal > $500'}
              </span>
            </span>
            <span className="text-sm font-medium text-success">-${formatCents(totals.discountAmountCents)}</span>
          </div>
        )}

        {totals.discountRate > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-border-light">
            <span className="text-sm text-gray-600">Subtotal After Discount</span>
            <span className="text-sm font-medium text-foreground">${formatCents(totals.subtotalAfterDiscountCents)}</span>
          </div>
        )}

        <div className="flex justify-between items-center py-2 border-b border-border-light">
          <span className="text-sm text-gray-600">Tax ({(totals.taxRate * 100).toFixed(0)}%)</span>
          <span className="text-sm font-medium text-foreground">${formatCents(totals.taxAmountCents)}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-border-light">
          <span className="text-sm text-gray-600">
            Shipping
            {totals.shippingCostCents === 0 && (
              <span className="ml-2 text-xs text-success font-medium">FREE</span>
            )}
          </span>
          <span className="text-sm font-medium text-foreground">
            ${formatCents(totals.shippingCostCents)}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 bg-gray-50 -mx-6 px-6 mt-4">
          <span className="text-base font-semibold text-foreground">Final Total</span>
          <span className="text-xl font-bold text-primary">${formatCents(totals.finalTotalCents)}</span>
        </div>
      </div>

      <div className="mt-4 border-t border-border-light pt-4">
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-primary transition-colors"
        >
          <span className="font-medium">Calculation Rules</span>
          <svg
            className={`w-4 h-4 transition-transform ${showLegend ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showLegend && (
          <div className="mt-3 space-y-3 text-xs text-gray-600 bg-gray-50 p-3 rounded">
            <div>
              <strong className="text-foreground">Bulk Discounts:</strong>
              <ul className="mt-1 ml-4 space-y-1 list-disc">
                {BULK_DISCOUNT_TIERS.slice().reverse().map((tier) => (
                  <li key={tier.threshold}>
                    {(tier.rate * 100).toFixed(0)}% discount when subtotal exceeds ${centsToAmount(tier.threshold).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <strong className="text-foreground">Tax:</strong>
              <p className="mt-1">{(totals.taxRate * 100).toFixed(0)}% calculated on the discounted subtotal</p>
            </div>
            <div>
              <strong className="text-foreground">Shipping:</strong>
              <p className="mt-1">
                ${formatCents(totals.shippingCostCents)} flat rate, FREE for orders over ${formatCents(FREE_SHIPPING_THRESHOLD_CENTS)} (after discount)
              </p>
            </div>
            <div>
              <strong className="text-foreground">Final Total:</strong>
              <p className="mt-1">Subtotal - Discount + Tax + Shipping</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
