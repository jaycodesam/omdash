import { configureStore } from "@reduxjs/toolkit";
import { orderApi } from "./api";

export const makeStore = () => {
  return configureStore({
    reducer: {
      [orderApi.reducerPath]: orderApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(orderApi.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
