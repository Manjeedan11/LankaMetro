import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/lib/features/authSlice";
import { Api } from "./api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [Api.reducerPath]: Api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(Api.middleware),
});
