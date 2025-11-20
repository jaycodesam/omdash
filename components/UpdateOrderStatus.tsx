'use client';

import { Card, Badge } from './ui';

interface UpdateOrderStatusProps {
  currentStatus: string;
  orderId: string;
  onStatusUpdate?: (newStatus: string, note: string) => void;
}

const statusVariants: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
  delivered: 'success',
  shipped: 'info',
  pending: 'warning',
  processing: 'info',
  cancelled: 'danger',
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

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

const getNextStatuses = (currentStatus: string): string[] => {
  switch (currentStatus) {
    case 'pending':
      return ['processing', 'cancelled'];
    case 'processing':
      return ['shipped', 'cancelled'];
    case 'shipped':
      return ['delivered'];
    case 'delivered':
    case 'cancelled':
      return [];
    default:
      return [];
  }
};

export function UpdateOrderStatus({ currentStatus, orderId, onStatusUpdate }: UpdateOrderStatusProps) {
  const nextStatuses = getNextStatuses(currentStatus);

  if (nextStatuses.length === 0) return null;

  const handleStatusClick = (newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(newStatus, '');
    }
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-foreground mb-4">Update Order Status</h3>

      <div className="mb-4">
        <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Current Status</label>
        <Badge variant={statusVariants[currentStatus] || 'info'}>
          {currentStatus.toUpperCase()}
        </Badge>
      </div>

      <div>
        <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
          Change Status To
        </label>
        <div className="flex gap-2">
          {nextStatuses.map((status) => {
            const variant = statusVariants[status] || 'info';

            return (
              <button
                key={status}
                onClick={() => handleStatusClick(status)}
                className={`px-4 py-2 text-sm font-medium rounded border transition-colors ${getStatusButtonClass(variant, true)}`}
              >
                {capitalize(status)}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
