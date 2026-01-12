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
        let itemFormat = action.payload.format;
        if (!itemFormat) {
            if (action.payload.type === 'audiobooks') {
                itemFormat = 'MP3';
            } else {
                itemFormat = 'PDF';
            }
        }
        
        state.cartItems.push({ ...action.payload, format: itemFormat,quantity: 1 });
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