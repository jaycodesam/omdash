import { Badge } from './ui';

interface Order {
  id: string;
  customer: string;
  email: string;
  subtotal: number;
  discount: number;
  tax: number;
  amount: number;
  status: string;
  date: string;
  items: number;
  createdAt: string;
}

interface OrderMetricsProps {
  orders: Order[];
}

export function OrderMetrics({ orders }: OrderMetricsProps) {
  const totalRevenue = orders
    .filter(order => order.status === 'delivered')
    .reduce((sum, order) => sum + order.amount, 0);

  const averageOrderValue = orders.length > 0
    ? orders.reduce((sum, order) => sum + order.amount, 0) / orders.length
    : 0;

  const ordersByStatus = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const now = new Date();
  const ordersRequiringAttention = orders.filter(order => {
    if (order.status !== 'pending') return false;
    const orderDate = new Date(order.createdAt);
    const hoursDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 24;
  }).length;

  const statusColors: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    delivered: 'success',
    shipped: 'info',
    pending: 'warning',
    processing: 'info',
    cancelled: 'danger',
  };

  return (
    <div className="grid grid-cols-5 gap-3 mb-4">
      <div className="bg-card border border-border rounded shadow-sm px-3 py-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-0.5">Total Revenue</p>
            <p className="text-xl font-bold text-success">
              ${totalRevenue.toFixed(2)}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">From delivered orders</p>
          </div>
          <div className="w-10 h-10 bg-success/10 rounded flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded shadow-sm px-3 py-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-0.5">Avg Order Value</p>
            <p className="text-xl font-bold text-primary">
              ${averageOrderValue.toFixed(2)}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">Across {orders.length} orders</p>
          </div>
          <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded shadow-sm px-3 py-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-0.5">Requires Attention</p>
            <p className={`text-xl font-bold ${ordersRequiringAttention > 0 ? 'text-danger' : 'text-gray-400'}`}>
              {ordersRequiringAttention}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">Pending &gt; 24 hours</p>
          </div>
          <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${
            ordersRequiringAttention > 0 ? 'bg-danger/10' : 'bg-gray-100'
          }`}>
            <svg className={`w-5 h-5 ${ordersRequiringAttention > 0 ? 'text-danger' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="col-span-2 bg-card border border-border rounded shadow-sm px-3 py-2 min-h-[120px]">
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Orders by Status</p>
          <div className="grid grid-cols-3 gap-x-2 gap-y-2 content-start">
            {Object.entries(ordersByStatus).length > 0 ? (
              Object.entries(ordersByStatus)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between text-xs pr-4">
                    <Badge variant={statusColors[status] || 'default'}>
                      {status.toUpperCase()}
                    </Badge>
                    <span className="font-semibold text-foreground text-xs">{count}</span>
                  </div>
                ))
            ) : (
              <p className="text-xs text-gray-400 col-span-3">No orders</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
