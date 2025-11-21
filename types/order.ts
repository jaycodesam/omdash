export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface StatusHistory {
  status: OrderStatus;
  timestamp: string; // ISO datetime
  updatedBy: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  orderDate: string; // ISO date
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  statusHistory: StatusHistory[];
}
