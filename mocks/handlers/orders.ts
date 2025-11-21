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

  // query parameters
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

  // filter - mock
  const filtered = filterOrders(filters);

  // validate
  const ordersArraySchema = z.array(orderSchema);
  const validationResult = ordersArraySchema.safeParse(filtered);

  if (!validationResult.success) {
    console.error("Mock data validation failed:", validationResult.error);
    return HttpResponse.json(
      { error: "Invalid orders data", details: validationResult.error.format() },
      { status: 500 }
    );
  }

  return HttpResponse.json(validationResult.data);
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
