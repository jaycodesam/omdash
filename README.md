# Order Management Dashboard

Modern order management system built with Next.js 15, featuring real-time status updates, advanced filtering, and cursor-based pagination.

**Tech Stack:** Next.js 15 • TypeScript • Redux Toolkit (RTK Query) • Tailwind CSS • Zod • MSW

**Key Features:**
- Order listing with filters (status, date range, amount, search)
- Real-time status updates with optimistic UI
- Cursor-based pagination for large datasets
- Centralized status transition validation
- Accurate currency handling (cents-based)
- MSW for API mocking in development
- Type-safe with Zod validation
- Optimistic updates with automatic rollback

## Architecture

### State Management
- **RTK Query** for data fetching, caching, and synchronization
- **Optimistic updates** for instant UI feedback
- **Cache invalidation** for automatic data refresh

### Data Validation
- **Zod schemas** for runtime validation
- **TypeScript** for compile-time type safety
- **Centralized validation** for API responses

### Status Transitions
Enforced state machine with allowed transitions:
```
pending → processing → shipped → delivered
   ↓          ↓          ↓          ↓
            cancelled (terminal)
```

### Currency Handling
All monetary values stored in cents (integers) to avoid floating-point errors:
- `formatCents()` - Display formatting
- `calculateOrderTotals()` - Complete order calculations
- `validateTransition()` - Business rule validation

## Project Structure

```
├── app/
│   ├── dashboard/
│   │   ├── orders/          # Orders list page
│   │   └── orders/[id]/     # Order detail page
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── providers/           # Context providers (MSW, Store)
│   └── [features]/          # Feature-specific components
├── store/
│   ├── api/                 # RTK Query endpoints
│   │   ├── getOrders.ts
│   │   ├── getOrderById.ts
│   │   └── updateOrderStatus.ts
│   └── index.ts             # Store configuration
├── mocks/
│   ├── handlers/            # MSW request handlers
│   └── data/                # Mock data generators
├── utils/
│   ├── currency.ts          # Currency helpers
│   └── orderStatus.ts       # Status transition logic
├── schemas/                 # Zod validation schemas
└── types/                   # TypeScript type definitions

```

## API Endpoints (Mocked)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/orders` | List orders with filters & pagination |
| `GET` | `/api/orders/:id` | Get single order details |
| `PATCH` | `/api/orders/:id/status` | Update order status |

**Query Parameters for `/api/orders`:**
- `cursor` - Pagination cursor
- `limit` - Items per page (default: 10)
- `direction` - `after` or `before`
- `status` - Filter by status
- `search` - Search order ID, customer name/email
- `dateFrom` / `dateTo` - Date range filter
- `minAmount` / `maxAmount` - Amount range (in cents)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Development Guidelines

### Adding New Endpoints
1. Create endpoint file in `store/api/`
2. Use `orderApi.injectEndpoints()` for type safety
3. Add Zod validation in `transformResponse`
4. Export the enhanced API and hooks
5. Create corresponding MSW handler in `mocks/handlers/`

### Status Transition Rules
Use centralized helpers from `utils/orderStatus.ts`:
```typescript
import { getAllowedTransitions, validateTransition } from '@/utils/orderStatus';

// Get valid next statuses
const allowedStatuses = getAllowedTransitions('pending');
// Returns: ['processing', 'cancelled']

// Validate before updating
const result = validateTransition('pending', 'shipped');
// Returns: { valid: false, error: "Cannot transition..." }
```

### Currency Calculations
Always use helpers from `utils/currency.ts`:
```typescript
import { calculateOrderTotals, formatCents } from '@/utils/currency';

// Calculate order totals
const totals = calculateOrderTotals(order.items);
// Returns: { subtotalCents, discountAmountCents, taxAmountCents, ... }

// Format for display
const price = formatCents(8999); // "89.99"
```

## Features in Detail

### Cursor-Based Pagination
- Handles large datasets efficiently
- Consistent results during real-time updates
- Supports forward and backward navigation
- Automatic cursor reset when filters change

### Optimistic Updates
- UI updates immediately on user action
- Automatic rollback on server errors
- Cache invalidation for data consistency
- Enhanced user experience with instant feedback

### Mock Service Worker (MSW)
- Intercepts API requests in development
- Returns realistic mock data (1000+ orders)
- Validates status transitions
- Simulates real API behavior

## Tech Decisions

| Decision | Reason |
|----------|--------|
| **Cents for currency** | Avoid floating-point precision errors |
| **Cursor pagination** | Better for real-time data, infinite scroll |
| **Zod validation** | Runtime safety + TypeScript integration |
| **RTK Query** | Built-in caching, optimistic updates |
| **MSW** | Realistic development without backend |
| **Centralized status logic** | Single source of truth for business rules |

## License

This project is for demonstration purposes.
