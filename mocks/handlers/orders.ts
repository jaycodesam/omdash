import { http, HttpResponse } from "msw";

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
    return HttpResponse.json({ id: params.id });
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
