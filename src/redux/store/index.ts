import { configureStore } from '@reduxjs/toolkit';
import invoicesReducer from './invoiceSlice';

// Configure the Redux store
export const store = configureStore({
  reducer: {
    invoices: invoicesReducer, 
    // You can add more reducers here as your app grows
  },
});

// Infer the `RootState` type from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {invoices: InvoicesState}

// Infer the `AppDispatch` type from the store
export type AppDispatch = typeof store.dispatch;