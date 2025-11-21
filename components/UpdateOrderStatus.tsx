'use client';

import { Card, Badge } from './ui';
import {
  type OrderStatus,
  getAllowedTransitions,
  STATUS_METADATA,
  isTerminalStatus,
} from '@/utils/orderStatus';
import { useUpdateOrderStatusMutation } from '@/store/api';
import { useState } from 'react';

interface UpdateOrderStatusProps {
  currentStatus: string;
  orderId: string;
  onStatusUpdate?: (newStatus: string, note: string) => void;
}

const getStatusButtonClass = (variant: string, isSelected: boolean): string => {
  if (!isSelected) {
    return 'bg-white text-gray-700 border-border hover:bg-gray-50';
  }

  switch (variant) {
    case 'success':
      return 'bg-success hover:bg-success/90 text-white border-success';
    case 'info':
      return 'bg-info hover:bg-info/90 text-white border-info';
    case 'warning':
      return 'bg-warning hover:bg-warning/90 text-white border-warning';
    case 'danger':
      return 'bg-danger hover:bg-danger/90 text-white border-danger';
    default:
      return 'bg-info hover:bg-info/90 text-white border-info';
  }
};

export function UpdateOrderStatus({ currentStatus, orderId, onStatusUpdate }: UpdateOrderStatusProps) {
  const [updateOrderStatus, { isLoading, error }] = useUpdateOrderStatusMutation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Get allowed transitions using centralized status manager
  const allowedStatuses = getAllowedTransitions(currentStatus as OrderStatus);

  // Don't show the card if no transitions are allowed (terminal state)
  if (allowedStatuses.length === 0) {
    if (isTerminalStatus(currentStatus as OrderStatus)) {
      return (
        <Card>
          <h3 className="text-lg font-semibold text-foreground mb-4">Update Order Status</h3>
          <div className="mb-4">
            <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Current Status</label>
            <Badge variant={STATUS_METADATA[currentStatus as OrderStatus]?.color || 'info'}>
              {STATUS_METADATA[currentStatus as OrderStatus]?.label.toUpperCase() || currentStatus.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 italic">
            This order is in a terminal state. No further status changes are allowed.
          </p>
        </Card>
      );
    }
    return null;
  }

  const handleStatusClick = async (newStatus: string) => {
    try {
      setSuccessMessage(null);

      // Call the mutation
      await updateOrderStatus({
        orderId,
        status: newStatus,
        note: '', // Can be extended to allow notes
      }).unwrap();

      // Show success message
      setSuccessMessage(`Status updated to ${STATUS_METADATA[newStatus as OrderStatus].label}`);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);

      // Call optional callback
      if (onStatusUpdate) {
        onStatusUpdate(newStatus, '');
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const currentMetadata = STATUS_METADATA[currentStatus as OrderStatus];

  return (
    <Card>
      <h3 className="text-lg font-semibold text-foreground mb-4">Update Order Status</h3>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
          ✓ {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          {'data' in error && typeof error.data === 'object' && error.data && 'error' in error.data
            ? String(error.data.error)
            : 'Failed to update order status'}
        </div>
      )}

      <div className="mb-4">
        <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Current Status</label>
        <div className="space-y-2">
          <Badge variant={currentMetadata?.color || 'info'}>
            {currentMetadata?.label.toUpperCase() || currentStatus.toUpperCase()}
          </Badge>
          {currentMetadata?.description && (
            <p className="text-xs text-gray-500">{currentMetadata.description}</p>
          )}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
          Available Status Transitions
        </label>
        <div className="flex flex-wrap gap-2">
          {allowedStatuses.map((status) => {
            const metadata = STATUS_METADATA[status];
            const variant = metadata.color;

            return (
              <button
                key={status}
                onClick={() => handleStatusClick(status)}
                disabled={isLoading}
                className={`px-4 py-2 text-sm font-medium rounded border transition-colors ${getStatusButtonClass(variant, true)} ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title={metadata.description}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  metadata.label
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Only valid status transitions are shown based on current order state.
        </p>
      </div>
    </Card>
  );
}
