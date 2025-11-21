import { orderApi } from './orderApi';
import { orderSchema } from '@/schemas/order';
import { z } from 'zod';
import type { GetOrdersParams, GetOrdersResponse } from '@/types/api';

const getOrdersEndpoint = orderApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getOrders: builder.query<GetOrdersResponse, GetOrdersParams | void>({
      query: (params) => {
        console.log('[RTK Query] Request params:', params);
        return {
          url: '/orders',
          params: params || {},
        };
      },

      transformResponse: (response: unknown) => {
        console.log('[RTK Query] Raw response:', response);

        // structure validation
        if (
          !response ||
          typeof response !== 'object' ||
          !('data' in response) ||
          !Array.isArray((response as any).data)
        ) {
          console.error('[RTK Query] Invalid API response structure:', response);
          throw new Error('Invalid response structure from API');
        }

        const typedResponse = response as GetOrdersResponse;

        // validate
        const ordersArraySchema = z.array(orderSchema);
        const result = ordersArraySchema.safeParse(typedResponse.data);

        if (!result.success) {
          console.error('Invalid API response:', result.error);
          throw new Error('Invalid orders data from API');
        }

        return {
          data: result.data,
          pageInfo: typedResponse.pageInfo,
          cursors: typedResponse.cursors,
        };
      },

      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Order' as const, id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),
  }),
});

export const { useGetOrdersQuery } = getOrdersEndpoint;
