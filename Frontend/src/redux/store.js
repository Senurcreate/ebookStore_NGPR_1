import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '../redux/features/cart/cartSlice'


export const store = configureStore({
  reducer: {
    
    cart: cartReducer
  }
  
})