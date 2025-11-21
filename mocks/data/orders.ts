import type { Order, OrderStatus, OrderItem, StatusHistory } from "@/types/order";

const statuses: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

const products = [
  { name: "Wireless Headphones", basePrice: 8999 },  // 89.99
  { name: "USB-C Cable", basePrice: 1250 },          // 12.50
  { name: "Phone Case", basePrice: 2499 },           // 24.99
  { name: "Laptop Stand", basePrice: 4500 },         // 45.00
  { name: "Wireless Mouse", basePrice: 2999 },       // 29.99
  { name: "Mechanical Keyboard", basePrice: 12999 }, // 129.99
  { name: "Monitor", basePrice: 29999 },             // 299.99
  { name: "Webcam", basePrice: 7999 },               // 79.99
  { name: "Desk Lamp", basePrice: 3999 },            // 39.99
  { name: "External SSD", basePrice: 14999 },        // 149.99
  { name: "Power Bank", basePrice: 4999 },           // 49.99
  { name: "Gaming Chair", basePrice: 39999 },        // 399.99
  { name: "Microphone", basePrice: 9999 },           // 99.99
  { name: "USB Hub", basePrice: 3499 },              // 34.99
  { name: "Cable Organizer", basePrice: 1599 },      // 15.99
];

const firstNames = ["John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Lisa", "James", "Maria"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
const domains = ["example.com", "email.com", "test.com", "demo.com", "sample.com"];

const generateCustomer = (id: number) => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return {
    id: `CUST-${String(id).padStart(4, "0")}`,
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`,
  };
};

const generateItems = (): OrderItem[] => {
  const itemCount = Math.floor(Math.random() * 5) + 1;
  const items: OrderItem[] = [];

  for (let i = 0; i < itemCount; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    items.push({
      id: `ITEM-${Math.random().toString(36).substr(2, 9)}`,
      productName: product.name,
      quantity: Math.floor(Math.random() * 3) + 1,
      unitPrice: product.basePrice, // stored in cents
    });
  }

  return items;
};

const generateStatusHistory = (finalStatus: OrderStatus, orderDate: Date): StatusHistory[] => {
  const history: StatusHistory[] = [];
  const statusFlow: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

  if (finalStatus === "cancelled") {
    const cancelAt = Math.floor(Math.random() * 3);
    for (let i = 0; i <= cancelAt; i++) {
      const timestamp = new Date(orderDate);
      timestamp.setHours(timestamp.getHours() + (i * 24));
      history.push({
        status: i === cancelAt ? "cancelled" : statusFlow[i],
        timestamp: timestamp.toISOString(),
        updatedBy: i === 0 ? "system" : `User ${Math.floor(Math.random() * 10) + 1}`,
      });
    }
  } else {
    const endIndex = statusFlow.indexOf(finalStatus);
    for (let i = 0; i <= endIndex; i++) {
      const timestamp = new Date(orderDate);
      timestamp.setHours(timestamp.getHours() + (i * 24));
      history.push({
        status: statusFlow[i],
        timestamp: timestamp.toISOString(),
        updatedBy: i === 0 ? "system" : `User ${Math.floor(Math.random() * 10) + 1}`,
      });
    }
  }

  return history.reverse();
};

const generateOrder = (id: number): Order => {
  const customer = generateCustomer(id);
  const items = generateItems();

  const daysAgo = Math.floor(Math.random() * 90);
  const orderDate = new Date();
  orderDate.setDate(orderDate.getDate() - daysAgo);

  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const statusHistory = generateStatusHistory(status, orderDate);

  return {
    id: `ORD-${String(id).padStart(4, "0")}`,
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    orderDate: orderDate.toISOString().split("T")[0],
    status,
    items,
    statusHistory,
  };
};

export const mockOrders: Order[] = Array.from({ length: 1000 }, (_, i) => generateOrder(i + 1));

export const getOrderById = (id: string): Order | undefined => {
  return mockOrders.find((order) => order.id === id);
};

export const filterOrders = (filters: {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}): Order[] => {
  let filtered = [...mockOrders];

  if (filters.status) {
    filtered = filtered.filter((o) => o.status === filters.status);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter((o) =>
      o.customerName.toLowerCase().includes(searchLower) ||
      o.customerEmail.toLowerCase().includes(searchLower) ||
      o.id.toLowerCase().includes(searchLower)
    );
  }

  if (filters.dateFrom) {
    filtered = filtered.filter((o) => o.orderDate >= filters.dateFrom!);
  }

  if (filters.dateTo) {
    filtered = filtered.filter((o) => o.orderDate <= filters.dateTo!);
  }

  // filters expect cents
  if (filters.minAmount !== undefined) {
    const total = (o: Order) => o.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    filtered = filtered.filter((o) => total(o) >= filters.minAmount!);
  }

  if (filters.maxAmount !== undefined) {
    const total = (o: Order) => o.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    filtered = filtered.filter((o) => total(o) <= filters.maxAmount!);
  }

  return filtered;
};
