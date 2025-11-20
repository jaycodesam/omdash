import { useState } from 'react';
import { Card } from './ui';

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface OrderCalculationProps {
  items: OrderItem[];
}

export function OrderCalculation({ items }: OrderCalculationProps) {
  const [showLegend, setShowLegend] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const getBulkDiscountRate = (subtotal: number): number => {
    if (subtotal > 2000) return 0.15;
    if (subtotal > 1000) return 0.10;
    if (subtotal > 500) return 0.05;
    return 0;
  };

  const discountRate = getBulkDiscountRate(subtotal);
  const discountAmount = subtotal * discountRate;
  const subtotalAfterDiscount = subtotal - discountAmount;

  const taxRate = 0.13;
  const taxAmount = subtotalAfterDiscount * taxRate;

  const shippingCost = subtotalAfterDiscount > 100 ? 0 : 10;

  const finalTotal = subtotalAfterDiscount + taxAmount + shippingCost;

  return (
    <Card>
      <h3 className="text-lg font-semibold text-foreground mb-4">Order Summary</h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-border-light">
          <span className="text-sm text-gray-600">Subtotal</span>
          <span className="text-sm font-medium text-foreground">${subtotal.toFixed(2)}</span>
        </div>

        {discountRate > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-border-light">
            <span className="text-sm text-gray-600">
              Bulk Discount ({(discountRate * 100).toFixed(0)}%)
              <span className="block text-xs text-gray-400">
                {discountRate === 0.15 && 'Subtotal > $2000'}
                {discountRate === 0.10 && 'Subtotal > $1000'}
                {discountRate === 0.05 && 'Subtotal > $500'}
              </span>
            </span>
            <span className="text-sm font-medium text-success">-${discountAmount.toFixed(2)}</span>
          </div>
        )}

        {discountRate > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-border-light">
            <span className="text-sm text-gray-600">Subtotal After Discount</span>
            <span className="text-sm font-medium text-foreground">${subtotalAfterDiscount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between items-center py-2 border-b border-border-light">
          <span className="text-sm text-gray-600">Tax ({(taxRate * 100).toFixed(0)}%)</span>
          <span className="text-sm font-medium text-foreground">${taxAmount.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-border-light">
          <span className="text-sm text-gray-600">
            Shipping
            {shippingCost === 0 && (
              <span className="ml-2 text-xs text-success font-medium">FREE</span>
            )}
          </span>
          <span className="text-sm font-medium text-foreground">
            {shippingCost === 0 ? '$0.00' : `$${shippingCost.toFixed(2)}`}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 bg-gray-50 -mx-6 px-6 mt-4">
          <span className="text-base font-semibold text-foreground">Final Total</span>
          <span className="text-xl font-bold text-primary">${finalTotal.toFixed(2)}</span>
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
                <li>5% discount when subtotal exceeds $500</li>
                <li>10% discount when subtotal exceeds $1,000</li>
                <li>15% discount when subtotal exceeds $2,000</li>
              </ul>
            </div>
            <div>
              <strong className="text-foreground">Tax:</strong>
              <p className="mt-1">13% calculated on the discounted subtotal</p>
            </div>
            <div>
              <strong className="text-foreground">Shipping:</strong>
              <p className="mt-1">$10 flat rate, FREE for orders over $100 (after discount)</p>
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
