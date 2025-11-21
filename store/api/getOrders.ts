import { orderApi } from './orderApi';
import { orderSchema } from '@/schemas/order';
import type { Order } from '@/types/order';
import { z } from 'zod';

export interface GetOrdersParams {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

const getOrdersEndpoint = orderApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], GetOrdersParams | void>({
      query: (params) => ({
        url: '/orders',
        params: params || {},
      }),

      transformResponse: (response: unknown) => {
        const ordersArraySchema = z.array(orderSchema);
        const result = ordersArraySchema.safeParse(response);

        if (!result.success) {
          console.error('Invalid API response:', result.error);
          throw new Error('Invalid orders data from API');
          // third party monitoring
        }

        return result.data;
      },

      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Order' as const, id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),
  }),
});

export const { useGetOrdersQuery } = getOrdersEndpoint;
