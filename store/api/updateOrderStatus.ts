import { orderApi } from './orderApi';
import { orderSchema } from '@/schemas/order';
import type { Order } from '@/types/order';

interface UpdateOrderStatusRequest {
  orderId: string;
  status: string;
  note?: string;
}

const updateOrderStatusEndpoint = orderApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    updateOrderStatus: builder.mutation<Order, UpdateOrderStatusRequest>({
      query: ({ orderId, status, note }) => ({
        url: `/orders/${orderId}/status`,
        method: 'PATCH',
        body: { status, note },
      }),

      transformResponse: (response: unknown) => {
        console.log('[RTK Query] Update status raw response:', response);

        // Validate with Zod schema
        const result = orderSchema.safeParse(response);

        if (!result.success) {
          console.error('[RTK Query] Invalid order response:', result.error);
          throw new Error('Invalid order data from API');
        }

        return result.data;
      },

      // Optimistic update and cache invalidation
      async onQueryStarted({ orderId, status }, { dispatch, queryFulfilled }) {
        // Optimistic update for getOrderById
        const patchResult = dispatch(
          orderApi.util.updateQueryData('getOrderById', orderId, (draft) => {
            draft.status = status as any;
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert optimistic update on error
          patchResult.undo();
        }
      },

      // Invalidate relevant caches
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        { type: 'Order', id: 'LIST' },
      ],
    }),
  }),
});

export const { useUpdateOrderStatusMutation } = updateOrderStatusEndpoint;
