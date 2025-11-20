import { Card, Badge } from './ui';

interface StatusHistoryItem {
  status: string;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

interface OrderStatusHistoryProps {
  history: StatusHistoryItem[];
  currentStatus: string;
}

export function OrderStatusHistory({ history, currentStatus }: OrderStatusHistoryProps) {
  const statusColors: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    delivered: 'success',
    shipped: 'info',
    pending: 'warning',
    processing: 'info',
    cancelled: 'danger',
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    const diffMs = end - start;

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const totalDuration = history.length > 0
    ? calculateDuration(history[history.length - 1].timestamp)
    : '0m';

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Order Status History</h3>
        <Badge variant={statusColors[currentStatus] || 'default'}>
          {currentStatus.toUpperCase()}
        </Badge>
      </div>

      {history.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded border border-border-light">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 font-medium">Total Order Time</span>
            <span className="text-sm font-semibold text-primary">{totalDuration}</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {history.map((item, index) => {
          const nextStatusTime = index > 0 ? history[index - 1].timestamp : undefined;
          const duration = calculateDuration(item.timestamp, nextStatusTime);

          return (
            <div key={index} className="relative pl-6 pb-4 border-l-2 border-border-light last:border-l-0 last:pb-0">
              <div className={`absolute left-0 top-0 -translate-x-[9px] w-4 h-4 rounded-full border-2 ${
                index === 0
                  ? 'bg-primary border-primary'
                  : 'bg-white border-gray-300'
              }`} />

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={statusColors[item.status] || 'default'}>
                    {item.status.toUpperCase()}
                  </Badge>
                  {index === 0 && (
                    <span className="text-xs text-primary font-medium">Current</span>
                  )}
                  <span className="text-xs text-gray-400">• {duration}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatTimestamp(item.timestamp)}</span>
                  {item.updatedBy && (
                    <>
                      <span>•</span>
                      <span>by {item.updatedBy}</span>
                    </>
                  )}
                </div>
                {item.note && (
                  <p className="text-sm text-gray-600 mt-1">{item.note}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {history.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No status history available
        </div>
      )}
    </Card>
  );
}
