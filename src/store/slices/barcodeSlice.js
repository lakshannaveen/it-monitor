import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { barcodeService } from "../../services/barcodeService";

export const fetchBarcodeTimes = createAsyncThunk(
  "barcode/fetchBarcodeTimes",
  async (_, { rejectWithValue }) => {
    try {
      const data = await barcodeService.getBarcodeTimes();
      return data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || "Failed to fetch data");
    }
  }
);

const barcodeSlice = createSlice({
  name: "barcode",
  initialState: {
    records: [],
    loading: false,
    error: null,
    lastFetched: null,
  },
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBarcodeTimes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBarcodeTimes.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchBarcodeTimes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = barcodeSlice.actions;
export default barcodeSlice.reducer;
