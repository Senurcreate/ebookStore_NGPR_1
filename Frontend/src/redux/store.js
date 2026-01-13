import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '../redux/features/cart/cartSlice'

//  Load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('ebook_cart');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

// Save state to localStorage
const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('ebook_cart', serializedState);
  } catch {
    // ignore write errors
  }
};

const preloadedState = {
  cart: loadState() // Load saved cart
};


export const store = configureStore({
  reducer: {
    cart: cartReducer
  },
  preloadedState // Inject saved state
});

// 3. Subscribe to store updates
store.subscribe(() => {
  saveState(store.getState().cart);
});