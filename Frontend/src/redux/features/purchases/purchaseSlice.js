import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchMyPurchases } from "../../../services/purchase.service";

// Async Thunk to fetch purchases
export const fetchPurchasedBooks = createAsyncThunk(
  "purchases/fetchPurchasedBooks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchMyPurchases();
      
      // 1. Normalize the response structure (Handle: [], {data: []}, or {purchases: []})
      let purchaseList = [];
      if (Array.isArray(response)) {
        purchaseList = response;
      } else if (response?.data && Array.isArray(response.data)) {
        purchaseList = response.data;
      } else if (response?.purchases && Array.isArray(response.purchases)) {
        purchaseList = response.purchases;
      }

      // 2. Extract ONLY the Book IDs into a simple array
      const purchasedIds = purchaseList.map((p) => {
         // Handle if 'book' is a populated object OR just an ID string
         if (p.book && typeof p.book === 'object') {
             return p.book._id || p.book.id;
         }
         return p.book;
      });

      // Returns a simple array of strings: ['id1', 'id2', 'id3']
      return purchasedIds; 
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

const purchaseSlice = createSlice({
  name: "purchases",
  initialState: {
    purchasedBookIds: [], 
    loading: false,
    error: null,
  },
  reducers: {
    clearPurchases: (state) => {
      state.purchasedBookIds = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchasedBooks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPurchasedBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.purchasedBookIds = action.payload;
      })
      .addCase(fetchPurchasedBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPurchases } = purchaseSlice.actions;
export default purchaseSlice.reducer;