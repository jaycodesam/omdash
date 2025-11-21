import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { isUnexpectedError, getUnexpectedErrorMessage } from '@/utils/api-error';

export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await fetchBaseQuery({ baseUrl: '/api' })(args, api, extraOptions);

  if (result.error) {
    const { error } = result;
    if (isUnexpectedError(error)) {
      const message = getUnexpectedErrorMessage(error);
      const endpoint = typeof args === 'string' ? args : args.url;

      // Log error details
      console.group('[API Error]');
      console.error('Status:', error.status);
      console.error('Message:', message);
      console.error('Endpoint:', endpoint);
      console.error('Error Data:', error.data);
      console.error('Full Error:', error);
      console.groupEnd();

      // TODO: toast here
      console.log('[Toast]', message);
    }

    // 4xxx
  }

  return result;
};
