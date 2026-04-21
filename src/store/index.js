import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";
import barcodeReducer from "./slices/barcodeSlice";

const store = configureStore({
  reducer: {
    ui: uiReducer,
    barcode: barcodeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
