import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '../redux/features/cart/cartSlice'
import { bookApi } from './features/books/bookApi';

export const store = configureStore({
  reducer: {
    [bookApi.reducerPath]: bookApi.reducer,
    cart: cartReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(bookApi.middleware),
})