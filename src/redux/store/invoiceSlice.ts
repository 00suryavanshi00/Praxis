import { Invoice } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InvoicesState {
  items: Invoice[];
  loading: boolean;
  error: string | null;
}

const initialState: InvoicesState = {
  items: [],
  loading: false,
  error: null
};

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    setInvoices: (state, action) => {
      state.items = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    }
  }
});

export const { setInvoices, setLoading, setError } = invoicesSlice.actions;
export default invoicesSlice.reducer;