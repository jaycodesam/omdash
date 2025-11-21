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

      // TODO:
      console.error('[API Error]', {
        status: error.status,
        message,
        endpoint: typeof args === 'string' ? args : args.url,
        error,
      });

      // TODO: toast here
      // TODO:
      console.log('[Toast]', message);
    }

    // 4xxx
  }

  return result;
};
