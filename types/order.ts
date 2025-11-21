import { z } from "zod";
import {
  orderStatusSchema,
  orderItemSchema,
  statusHistorySchema,
  orderSchema,
} from "@/schemas/order";

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type StatusHistory = z.infer<typeof statusHistorySchema>;
export type Order = z.infer<typeof orderSchema>;
