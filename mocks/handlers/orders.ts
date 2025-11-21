import { http, HttpResponse } from "msw";
import { mockOrders, getOrderById, filterOrders } from "@/mocks/data/orders";
import { orderSchema } from "@/schemas/order";

/**
 * As mentioned
 * GET /api/orders - support query params, status, search, dateFrom, dateTo, minAmount, maxAmount
 * GET /api/orders/:id
 * PATCH /api/orders/:id/status
 * PATCH /api/orders/bulk-status - { orderIds: string[], status: OrderStatus }
 * GET /api/metrics
 */

export const orderHandlers = [
  // GET /api/orders
  http.get("/api/orders", () => {
    return HttpResponse.json([]);
  }),

  // GET /api/orders/:id
  http.get("/api/orders/:id", ({ params }) => {
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
  }),

  // PATCH /api/orders/:id/status
  http.patch("/api/orders/:id/status", async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: params.id, ...body });
  }),

  // PATCH /api/orders/bulk-status
  http.patch("/api/orders/bulk-status", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ success: true, ...body });
  }),

  // GET /api/metrics
  http.get("/api/metrics", () => {
    return HttpResponse.json({});
  }),
];
