import { z } from "zod";

export const orderStatusSchema = z.enum([
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const orderItemSchema = z.object({
  id: z.string().min(1, "Item ID is required"),
  productName: z.string().min(1, "Product name is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  unitPrice: z.number().positive("Unit price must be positive"),
});

export const statusHistorySchema = z.object({
  status: orderStatusSchema,
  timestamp: z.iso.datetime("Invalid ISO datetime format"),
  updatedBy: z.string().min(1, "Updated by is required"),
});

export const orderSchema = z.object({
  id: z.string().min(1, "Order ID is required"),
  customerId: z.string().min(1, "Customer ID is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.email("Invalid email address"),
  orderDate: z.iso.date("Invalid ISO date format"),
  status: orderStatusSchema,
  items: z.array(orderItemSchema).min(1, "Order must have at least one item"),
  statusHistory: z.array(statusHistorySchema),
});
