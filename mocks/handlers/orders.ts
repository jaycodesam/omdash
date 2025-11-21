import { http, HttpResponse } from "msw";
import { mockOrders, getOrderById, filterOrders } from "@/mocks/data/orders";
import { orderSchema } from "@/schemas/order";
import { z } from "zod";

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
    const cursorIndex = filtered.findIndex((order) => order.id === cursor);

    if (cursorIndex === -1) {
      // invalid or filtered out
      return HttpResponse.json(
        { error: "Invalid cursor" },
        { status: 400 }
      );
    }

    if (direction === 'after') {
      // items after cursor
      startIndex = cursorIndex + 1;
    } else {
      // items before cursor (backwards)
      startIndex = Math.max(0, cursorIndex - limit);
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
    console.error("Mock data validation failed:", validationResult.error);
    return HttpResponse.json(
      { error: "Invalid orders data", details: validationResult.error.format() },
      { status: 500 }
    );
  }
  return HttpResponse.json({
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
  });
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
  const body = (await request.json()) as Record<string, unknown>;
  return HttpResponse.json({ id: params.id, ...body });
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
