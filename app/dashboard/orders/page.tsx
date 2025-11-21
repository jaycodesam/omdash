'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Badge, Button, Input, Table } from '@/components/ui';
import { OrderMetrics } from '@/components/OrderMetrics';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetOrdersQuery } from '@/store/api';
import type { Order as OrderType } from '@/types/order';
import { centsToAmount, calculateTax, formatCents } from '@/utils/currency';

// Mock data
const mockOrders = [
  { id: 'ORD-1234', customer: 'John Doe', email: 'john@example.com', subtotal: 220.00, discount: 10.00, tax: 27.30, amount: 237.30, status: 'delivered', date: '2024-01-15', createdAt: '2024-01-15T10:30:00', items: 3 },
  { id: 'ORD-1235', customer: 'Jane Smith', email: 'jane@example.com', subtotal: 420.00, discount: 15.00, tax: 52.65, amount: 457.65, status: 'pending', date: '2024-01-15', createdAt: '2024-01-15T09:45:00', items: 2 },
  { id: 'ORD-1236', customer: 'Bob Johnson', email: 'bob@example.com', subtotal: 750.00, discount: 50.00, tax: 91.00, amount: 791.00, status: 'processing', date: '2024-01-14', createdAt: '2024-01-14T14:20:00', items: 5 },
  { id: 'ORD-1237', customer: 'Alice Williams', email: 'alice@example.com', subtotal: 110.00, discount: 0.00, tax: 14.30, amount: 124.30, status: 'shipped', date: '2024-01-14', createdAt: '2024-01-14T11:00:00', items: 1 },
  { id: 'ORD-1238', customer: 'Charlie Brown', email: 'charlie@example.com', subtotal: 540.00, discount: 20.00, tax: 67.60, amount: 587.60, status: 'pending', date: '2024-01-13', createdAt: '2024-01-13T08:30:00', items: 4 },
  { id: 'ORD-1239', customer: 'David Lee', email: 'david@example.com', subtotal: 320.00, discount: 5.00, tax: 40.95, amount: 355.95, status: 'processing', date: '2024-01-13', createdAt: '2024-01-13T16:15:00', items: 2 },
  { id: 'ORD-1240', customer: 'Emma Wilson', email: 'emma@example.com', subtotal: 650.00, discount: 30.00, tax: 80.60, amount: 700.60, status: 'delivered', date: '2024-01-12', createdAt: '2024-01-12T13:45:00', items: 6 },
  { id: 'ORD-1241', customer: 'Frank Miller', email: 'frank@example.com', subtotal: 220.00, discount: 0.00, tax: 28.60, amount: 248.60, status: 'cancelled', date: '2024-01-12', createdAt: '2024-01-12T10:00:00', items: 1 },
  { id: 'ORD-1242', customer: 'Grace Davis', email: 'grace@example.com', subtotal: 850.00, discount: 40.00, tax: 105.30, amount: 915.30, status: 'delivered', date: '2024-01-11', createdAt: '2024-01-11T15:30:00', items: 7 },
  { id: 'ORD-1243', customer: 'Henry Garcia', email: 'henry@example.com', subtotal: 440.00, discount: 10.00, tax: 55.90, amount: 485.90, status: 'shipped', date: '2024-01-11', createdAt: '2024-01-11T12:00:00', items: 3 },
];

const getStatusBadge = (status: string) => {
  const variants: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    delivered: 'success',
    shipped: 'info',
    pending: 'warning',
    processing: 'info',
    cancelled: 'danger',
  };
  return <Badge variant={variants[status] || 'default'}>{status.toUpperCase()}</Badge>;
};

type Order = {
  id: string;
  customer: string;
  email: string;
  subtotal: number;
  discount: number;
  tax: number;
  amount: number;
  status: string;
  date: string;
  createdAt: string;
  items: number;
};

export default function OrdersPage() {
  const router = useRouter();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // Cursor pagination state
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [direction, setDirection] = useState<'after' | 'before'>('after');
  const [limit] = useState(10);

  // Selection state
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showBulkStatusUpdate, setShowBulkStatusUpdate] = useState(false);
  const [bulkStatusValue, setBulkStatusValue] = useState('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Reset cursor when filters change
  useEffect(() => {
    setCursor(undefined);
    setDirection('after');
  }, [statusFilter, searchQuery, startDate, endDate, minAmount, maxAmount]);

  // RTK Query - Get orders with cursor pagination + filters
  const { data: response, error, isLoading } = useGetOrdersQuery({
    cursor,
    limit,
    direction,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchQuery || undefined,
    dateFrom: startDate || undefined,
    dateTo: endDate || undefined,
    minAmount: minAmount ? Number(minAmount) * 100 : undefined,
    maxAmount: maxAmount ? Number(maxAmount) * 100 : undefined,
  });

  // Transform Order[] to table format with calculated fields
  const orders = useMemo(() => {
    if (!response?.data) return [];

    return response.data.map((order) => {
      // Calculate amounts in cents
      const subtotalCents = order.items.reduce(
        (sum, item) => sum + (item.quantity * item.unitPrice),
        0
      );
      const taxCents = calculateTax(subtotalCents, 0.13);
      const discountCents = 0; // Not in schema
      const totalCents = subtotalCents + taxCents - discountCents;

      return {
        id: order.id,
        customer: order.customerName,
        email: order.customerEmail,
        subtotal: centsToAmount(subtotalCents),
        discount: centsToAmount(discountCents),
        tax: centsToAmount(taxCents),
        amount: centsToAmount(totalCents),
        status: order.status,
        date: order.orderDate,
        createdAt: order.orderDate,
        items: order.items.length,
      };
    });
  }, [response]);

  // API handles all filtering, no need for client-side filtering
  const filteredOrders = orders;

  // Pagination info
  const pageInfo = response?.pageInfo;
  const cursors = response?.cursors;

  // Pagination handlers
  const handleNextPage = () => {
    if (cursors?.next && pageInfo?.hasNextPage) {
      setCursor(cursors.next);
      setDirection('after');
    }
  };

  const handlePreviousPage = () => {
    if (cursors?.previous && pageInfo?.hasPreviousPage) {
      setCursor(cursors.previous);
      setDirection('before');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Orders">
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading orders...</p>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Orders">
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Failed to load orders</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrders(filteredOrders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const isAllSelected = filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length;
  const isSomeSelected = selectedOrders.length > 0 && selectedOrders.length < filteredOrders.length;

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatusValue) return;

    setIsBulkUpdating(true);

    // Simulate API call - in a real application, this would be an actual API request
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log(`Updating ${selectedOrders.length} orders to status: ${bulkStatusValue}`);

    setIsBulkUpdating(false);

    // Show success message
    alert(`Successfully updated ${selectedOrders.length} order(s) to ${bulkStatusValue.toUpperCase()}`);

    // Reset
    setShowBulkStatusUpdate(false);
    setBulkStatusValue('');
    setSelectedOrders([]);
  };

  const columns = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={isAllSelected}
          ref={(input) => {
            if (input) {
              input.indeterminate = isSomeSelected;
            }
          }}
          onChange={handleSelectAll}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
        />
      ),
      render: (order: Order) => (
        <input
          type="checkbox"
          checked={selectedOrders.includes(order.id)}
          onChange={(e) => {
            e.stopPropagation();
            handleSelectOrder(order.id);
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
        />
      ),
      width: '50px',
    },
    {
      key: 'id',
      header: 'Order ID',
      render: (order: Order) => (
        <Link
          href={`/dashboard/orders/${order.id}`}
          className="text-sm font-medium text-primary hover:text-primary-dark"
        >
          {order.id}
        </Link>
      ),
    },
    {
      key: 'customer',
      header: 'Customer Name',
      render: (order: Order) => (
        <span className="font-medium">{order.customer}</span>
      ),
    },
    {
      key: 'date',
      header: 'Order Date',
      render: (order: Order) => (
        <span className="text-gray-500">{order.date}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (order: Order) => getStatusBadge(order.status),
    },
    {
      key: 'subtotal',
      header: 'Subtotal',
      render: (order: Order) => (
        <span className="text-foreground">${order.subtotal.toFixed(2)}</span>
      ),
    },
    {
      key: 'tax',
      header: 'Tax (13%)',
      render: (order: Order) => (
        <span className="text-foreground">${order.tax.toFixed(2)}</span>
      ),
    },
    {
      key: 'discount',
      header: 'Discount',
      render: (order: Order) => (
        <span className="text-success">-${order.discount.toFixed(2)}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Final Total',
      render: (order: Order) => (
        <span className="font-semibold text-primary">${order.amount.toFixed(2)}</span>
      ),
    },
    {
      key: 'items',
      header: 'Number of Items',
    },
  ];

  return (
    <DashboardLayout
      title="Orders"
    >
      {/* Metrics Cards */}
      <OrderMetrics orders={filteredOrders} />

      <Card>
        {/* Filters */}
        {selectedOrders.length === 0 && (
        <div className="space-y-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by order ID or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-border rounded bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27none%27%3e%3cpath d=%27M7 7l3 3 3-3%27 stroke=%27%23565656%27 stroke-width=%271.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3e%3c/svg%3e')] bg-[length:1.5em] bg-[right_0.5rem_center] bg-no-repeat"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Amount Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || statusFilter !== 'all' || startDate || endDate || minAmount || maxAmount) && (
            <div className="flex justify-end">
              <Button
                variant="flat"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setStartDate('');
                  setEndDate('');
                  setMinAmount('');
                  setMaxAmount('');
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
        )}

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="mb-4 p-4 bg-white border border-border rounded shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                <span className="text-primary font-semibold">{selectedOrders.length}</span> order{selectedOrders.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkStatusUpdate(!showBulkStatusUpdate)}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Update Status
                </Button>
                <Button
                  variant="flat"
                  size="sm"
                  onClick={() => {
                    setSelectedOrders([]);
                    setShowBulkStatusUpdate(false);
                    setBulkStatusValue('');
                  }}
                >
                  Clear Selection
                </Button>
              </div>
            </div>

            {/* Bulk Status Update UI */}
            {showBulkStatusUpdate && (
              <div className="mt-4 pt-4 border-t border-border-light">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select new status:
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setBulkStatusValue('pending')}
                    disabled={isBulkUpdating}
                    className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                      bulkStatusValue === 'pending'
                        ? 'bg-warning text-gray-900 ring-2 ring-warning ring-offset-2'
                        : 'bg-warning bg-opacity-10 text-warning hover:bg-opacity-20 border border-warning'
                    } ${isBulkUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setBulkStatusValue('processing')}
                    disabled={isBulkUpdating}
                    className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                      bulkStatusValue === 'processing'
                        ? 'bg-info text-white ring-2 ring-info ring-offset-2'
                        : 'bg-info bg-opacity-10 text-info hover:bg-opacity-20 border border-info'
                    } ${isBulkUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Processing
                  </button>
                  <button
                    onClick={() => setBulkStatusValue('shipped')}
                    disabled={isBulkUpdating}
                    className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                      bulkStatusValue === 'shipped'
                        ? 'bg-info text-white ring-2 ring-info ring-offset-2'
                        : 'bg-info bg-opacity-10 text-info hover:bg-opacity-20 border border-info'
                    } ${isBulkUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Shipped
                  </button>
                  <button
                    onClick={() => setBulkStatusValue('delivered')}
                    disabled={isBulkUpdating}
                    className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                      bulkStatusValue === 'delivered'
                        ? 'bg-success text-white ring-2 ring-success ring-offset-2'
                        : 'bg-success bg-opacity-10 text-success hover:bg-opacity-20 border border-success'
                    } ${isBulkUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Delivered
                  </button>
                  <button
                    onClick={() => setBulkStatusValue('cancelled')}
                    disabled={isBulkUpdating}
                    className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                      bulkStatusValue === 'cancelled'
                        ? 'bg-danger text-white ring-2 ring-danger ring-offset-2'
                        : 'bg-danger bg-opacity-10 text-danger hover:bg-opacity-20 border border-danger'
                    } ${isBulkUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Cancelled
                  </button>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleBulkStatusUpdate}
                    disabled={!bulkStatusValue || isBulkUpdating}
                  >
                    {isBulkUpdating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      'Apply Changes'
                    )}
                  </Button>
                  <Button
                    variant="flat"
                    size="sm"
                    disabled={isBulkUpdating}
                    onClick={() => {
                      setShowBulkStatusUpdate(false);
                      setBulkStatusValue('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results count and Pagination */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            Showing {filteredOrders.length} orders per page
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pageInfo?.hasPreviousPage || isLoading}
              onClick={handlePreviousPage}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pageInfo?.hasNextPage || isLoading}
              onClick={handleNextPage}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Orders Table */}
        <Table
          columns={columns}
          data={filteredOrders}
          onRowClick={(order) => router.push(`/dashboard/orders/${order.id}`)}
          className="-mx-6"
        />
      </Card>
    </DashboardLayout>
  );
}
