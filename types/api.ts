import type { Order } from './order';

// pagination
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface Cursors {
  next: string | null;
  previous: string | null;
}

// params
export interface GetOrdersParams {
  // cursor
  cursor?: string;
  limit?: number;
  direction?: 'after' | 'before';

  // filters
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface GetOrdersResponse {
  data: Order[];
  pageInfo: PageInfo;
  cursors: Cursors;
}
