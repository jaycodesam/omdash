import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Order } from '@/types/order';
import { orderSchema } from '@/schemas/order';

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Order'],
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

export const { useGetOrderByIdQuery } = orderApi;
