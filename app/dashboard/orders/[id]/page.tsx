'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Badge, Button } from '@/components/ui';
import { OrderCalculation } from '@/components/OrderCalculation';
import { OrderStatusHistory } from '@/components/OrderStatusHistory';
import { CustomerDetails } from '@/components/CustomerDetails';
import { UpdateOrderStatus } from '@/components/UpdateOrderStatus';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useGetOrderByIdQuery } from '@/store/api';

// Mock data - DEPRECATED: Now using RTK Query
const mockOrderData = {
  'ORD-1234': {
    id: 'ORD-1234',
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, New York, NY 10001',
    },
    items: [
      { productName: 'Wireless Headphones', quantity: 2, unitPrice: 89.99 },
      { productName: 'USB-C Cable', quantity: 3, unitPrice: 12.50 },
      { productName: 'Phone Case', quantity: 1, unitPrice: 24.99 },
    ],
    status: 'delivered',
    statusHistory: [
      { status: 'delivered', timestamp: '2024-01-15T16:30:00', note: 'Package delivered successfully', updatedBy: 'system' },
      { status: 'shipped', timestamp: '2024-01-14T10:15:00', note: 'Out for delivery', updatedBy: 'John Smith' },
      { status: 'processing', timestamp: '2024-01-13T14:20:00', note: 'Order is being prepared', updatedBy: 'Sarah Johnson' },
      { status: 'pending', timestamp: '2024-01-13T10:30:00', note: 'Order received and awaiting processing', updatedBy: 'system' },
    ],
    orderDate: '2024-01-13',
  },
  'ORD-1235': {
    id: 'ORD-1235',
    customer: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1 (555) 234-5678',
      address: '456 Oak Ave, Los Angeles, CA 90001',
    },
    items: [
      { productName: 'Laptop Stand', quantity: 1, unitPrice: 45.00 },
      { productName: 'Wireless Mouse', quantity: 2, unitPrice: 29.99 },
    ],
    status: 'pending',
    statusHistory: [
      { status: 'pending', timestamp: '2024-01-15T09:45:00', note: 'Order received and awaiting processing', updatedBy: 'system' },
    ],
    orderDate: '2024-01-15',
  },
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  // RTK Query hook - replaces mock data
  const { data: order, error, isLoading } = useGetOrderByIdQuery(orderId);

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Loading...">
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading order details...</p>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    const isNotFound = 'status' in error && error.status === 404;

    return (
      <DashboardLayout title={isNotFound ? "Order Not Found" : "Error"}>
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {isNotFound ? 'Order not found' : 'Failed to load order'}
            </p>
            <Link href="/dashboard/orders">
              <Button>Back to Orders</Button>
            </Link>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  // No data (shouldn't happen, but type safety)
  if (!order) {
    return (
      <DashboardLayout title="Order Not Found">
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Order not found</p>
            <Link href="/dashboard/orders">
              <Button>Back to Orders</Button>
            </Link>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  const statusColors: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    delivered: 'success',
    shipped: 'info',
    pending: 'warning',
    processing: 'info',
    cancelled: 'danger',
  };

  return (
    <DashboardLayout
      title={`Order ${order.id}`}
      action={
        <Link href="/dashboard/orders">
          <Button variant="outline" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Orders
          </Button>
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details */}
          <CustomerDetails
            customer={{
              name: order.customerName,
              email: order.customerEmail,
              phone: '', // Not in schema
              address: '', // Not in schema
            }}
            orderDate={order.orderDate}
          />

          {/* Itemized List */}
          <Card>
            <h3 className="text-lg font-semibold text-foreground mb-4">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-light">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Line Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border-light">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-foreground font-medium">
                        {item.productName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        ${(item.unitPrice / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        ${((item.quantity * item.unitPrice) / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Order Calculation */}
          <OrderCalculation items={order.items} />

          {/* Update Status */}
          <UpdateOrderStatus
            currentStatus={order.status}
            orderId={order.id}
          />

          {/* Status History */}
          <OrderStatusHistory
            history={order.statusHistory}
            currentStatus={order.status}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
