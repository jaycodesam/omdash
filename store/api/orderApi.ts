import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery,
  tagTypes: ['Order', 'Metrics'],
  endpoints: () => ({}), // endpoints will be injected
});
