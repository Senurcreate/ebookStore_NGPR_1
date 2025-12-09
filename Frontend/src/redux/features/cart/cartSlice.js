// cartSlice.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  cartItems: [],
  cartCount: 0
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.cartItems.find(item => item.id === action.payload.id);
      
      if (!existingItem) {
        state.cartItems.push({ ...action.payload, quantity: 1 });
        state.cartCount += 1;
      }
    },
    removeFromCart: (state, action) => {
      const index = state.cartItems.findIndex(item => item.id === action.payload);
      if (index !== -1) {
        state.cartItems.splice(index, 1);
        state.cartCount -= 1;
      }
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.cartCount = 0;
    }
  }
})

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;