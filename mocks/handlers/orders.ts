import { http, HttpResponse } from "msw";
import { mockOrders, getOrderById, filterOrders } from "@/mocks/data/orders";
import { orderSchema } from "@/schemas/order";
import { z } from "zod";
import {
  type OrderStatus,
  validateTransition,
  STATUS_METADATA,
} from "@/utils/orderStatus";

/**
 * GET /api/orders - support query params, status, search, dateFrom, dateTo, minAmount, maxAmount
 * GET /api/orders/:id
 * PATCH /api/orders/:id/status
 * PATCH /api/orders/bulk-status - { orderIds: string[], status: OrderStatus }
 * GET /api/metrics
 */

// GET /api/orders
const getOrders = http.get("/api/orders", ({ request }) => {
  const url = new URL(request.url);

  // pagination params
  const cursor = url.searchParams.get('cursor') || undefined;
  const limit = Number(url.searchParams.get('limit')) || 20;
  const direction = url.searchParams.get('direction') || 'after'; // 'after' or 'before'

  console.log('[MSW] GET /api/orders', { cursor, limit, direction });

  // filters
  const filters = {
    status: url.searchParams.get('status') || undefined,
    search: url.searchParams.get('search') || undefined,
    dateFrom: url.searchParams.get('dateFrom') || undefined,
    dateTo: url.searchParams.get('dateTo') || undefined,
    minAmount: url.searchParams.get('minAmount')
      ? Number(url.searchParams.get('minAmount'))
      : undefined,
    maxAmount: url.searchParams.get('maxAmount')
      ? Number(url.searchParams.get('maxAmount'))
      : undefined,
  };

  // do filtering first
  const filtered = filterOrders(filters);

  // cursor position
  let startIndex = 0;
  if (cursor) {
    console.log('[MSW] Finding cursor in filtered results:', cursor);
    const cursorIndex = filtered.findIndex((order) => order.id === cursor);
    console.log('[MSW] Cursor index:', cursorIndex, 'Total filtered:', filtered.length);

    if (cursorIndex === -1) {
      // Invalid cursor - likely due to filter change
      // Return first page instead of error for better UX
      console.warn('[MSW] Invalid cursor (likely filter changed), returning first page:', cursor);
      startIndex = 0;
    } else {
      if (direction === 'after') {
        // items after cursor
        startIndex = cursorIndex + 1;
      } else {
        // items before cursor (backwards)
        startIndex = Math.max(0, cursorIndex - limit);
      }
      console.log('[MSW] Start index:', startIndex);
    }
  }

  // paginated data
  let paginatedData: typeof filtered;

  if (direction === 'after' || !cursor) {
    // forward
    paginatedData = filtered.slice(startIndex, startIndex + limit);
  } else {
    // backward
    paginatedData = filtered.slice(startIndex, startIndex + limit);
  }

  // cursors and hasMore flags
  const hasNextPage = cursor && direction === 'after'
    ? startIndex + limit < filtered.length
    : !cursor && paginatedData.length === limit && startIndex + limit < filtered.length;

  const hasPreviousPage = startIndex > 0;

  const nextCursor = hasNextPage && paginatedData.length > 0
    ? paginatedData[paginatedData.length - 1].id
    : null;

  const previousCursor = hasPreviousPage && paginatedData.length > 0
    ? paginatedData[0].id
    : null;

  // validate
  const ordersArraySchema = z.array(orderSchema);
  const validationResult = ordersArraySchema.safeParse(paginatedData);

  if (!validationResult.success) {
    console.error("[MSW] Mock data validation failed:", validationResult.error);
    return HttpResponse.json(
      { error: "Invalid orders data", details: validationResult.error.format() },
      { status: 500 }
    );
  }

  const response = {
    data: validationResult.data,
    pageInfo: {
      hasNextPage,
      hasPreviousPage,
      startCursor: paginatedData.length > 0 ? paginatedData[0].id : null,
      endCursor: paginatedData.length > 0 ? paginatedData[paginatedData.length - 1].id : null,
    },
    cursors: {
      next: nextCursor,
      previous: previousCursor,
    },
  };

  console.log('[MSW] Returning response:', {
    dataCount: response.data.length,
    pageInfo: response.pageInfo,
    cursors: response.cursors,
  });

  return HttpResponse.json(response);
});

// GET /api/orders/:id
const getOrderByIdHandler = http.get("/api/orders/:id", ({ params }) => {
  const { id } = params;

  if (typeof id !== "string") {
    return HttpResponse.json(
      { error: "Invalid order ID" },
      { status: 400 }
    );
  }

  const order = getOrderById(id);

  if (!order) {
    return HttpResponse.json(
      { error: "Order not found" },
      { status: 404 }
    );
  }

  // Validate with Zod schema
  const validationResult = orderSchema.safeParse(order);

  if (!validationResult.success) {
    console.error("Mock data validation failed:", validationResult.error);
    return HttpResponse.json(
      { error: "Invalid order data", details: validationResult.error.format() },
      { status: 500 }
    );
  }

  return HttpResponse.json(validationResult.data);
});

// PATCH /api/orders/:id/status
const updateOrderStatus = http.patch("/api/orders/:id/status", async ({ params, request }) => {
  console.log('[MSW] PATCH /api/orders/:id/status handler called!', { params, url: request.url });

  const { id } = params;

  // basic validation
  if (typeof id !== 'string') {
    console.error('[MSW] Invalid order ID');
    return HttpResponse.json(
      { error: 'Invalid order ID' },
      { status: 400 }
    );
  }

  // request body
  const body = await request.json() as { status: string; note?: string };
  const newStatus = body.status;
  const note = body.note || '';

  console.log('[MSW] PATCH /api/orders/:id/status', { id, currentStatus: '?', newStatus, note });

  // order
  const orderIndex = mockOrders.findIndex(order => order.id === id);

  if (orderIndex === -1) {
    console.error('[MSW] Order not found:', id);
    return HttpResponse.json(
      { error: 'Order not found' },
      { status: 404 }
    );
  }

  const order = mockOrders[orderIndex];
  const currentStatus = order.status;

  console.log('[MSW] Current status:', currentStatus, '→ New status:', newStatus);

  // status transition
  const validation = validateTransition(
    currentStatus as OrderStatus,
    newStatus as OrderStatus
  );

  if (!validation.valid) {
    console.error('[MSW] Invalid status transition:', validation.error);
    return HttpResponse.json(
      {
        error: validation.error,
        currentStatus,
        requestedStatus: newStatus,
      },
      { status: 400 }
    );
  }

  // update order status
  const updatedOrder = {
    ...order,
    status: newStatus as OrderStatus,
    statusHistory: [
      {
        status: newStatus as OrderStatus,
        timestamp: new Date().toISOString(),
        updatedBy: 'system', //
      },
      ...order.statusHistory,
    ],
  };

  //mock data update
  mockOrders[orderIndex] = updatedOrder;

  console.log('[MSW] Order status updated successfully:', {
    orderId: id,
    oldStatus: currentStatus,
    newStatus,
  });

  // validate
  const validationResult = orderSchema.safeParse(updatedOrder);

  if (!validationResult.success) {
    console.error('[MSW] Updated order validation failed:', validationResult.error);
    return HttpResponse.json(
      { error: 'Invalid order data after update' },
      { status: 500 }
    );
  }

  return HttpResponse.json(validationResult.data);
});

// PATCH /api/orders/bulk-status
const bulkUpdateOrderStatus = http.patch("/api/orders/bulk-status", async ({ request }) => {
  const body = (await request.json()) as Record<string, unknown>;
  return HttpResponse.json({ success: true, ...body });
});

// GET /api/metrics
const getMetrics = http.get("/api/metrics", () => {
  return HttpResponse.json({});
});

export const orderHandlers = [
  getOrders,
  getOrderByIdHandler,
  updateOrderStatus,
  bulkUpdateOrderStatus,
  getMetrics,
];
