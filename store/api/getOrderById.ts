import { orderApi } from './orderApi';
import { orderSchema } from '@/schemas/order';
import type { Order } from '@/types/order';

const getOrderByIdEndpoint = orderApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrderById: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,

      transformResponse: (response: unknown) => {
        const result = orderSchema.safeParse(response);

        if (!result.success) {
          console.error('Invalid API response:', result.error);
          throw new Error('Invalid order data from API');
        }

        return result.data;
      },

      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
  }),
});

export const { useGetOrderByIdQuery } = getOrderByIdEndpoint;
