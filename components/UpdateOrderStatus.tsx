'use client';

import { Card, Badge } from './ui';
import {
  type OrderStatus,
  getAllowedTransitions,
  STATUS_METADATA,
  isTerminalStatus,
} from '@/utils/orderStatus';

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

  const handleStatusClick = (newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(newStatus, '');
    }
  };

  const currentMetadata = STATUS_METADATA[currentStatus as OrderStatus];

  return (
    <Card>
      <h3 className="text-lg font-semibold text-foreground mb-4">Update Order Status</h3>

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
                className={`px-4 py-2 text-sm font-medium rounded border transition-colors ${getStatusButtonClass(variant, true)}`}
                title={metadata.description}
              >
                {metadata.label}
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
