import axios from 'axios';
import {
  createSlice, createEntityAdapter, createAsyncThunk, PayloadAction,
} from '@reduxjs/toolkit';
import type { RootState } from './index';
import type { Item } from '../types/Item';
import type { InitialState } from '../types/InitialState';
import routes from '../routes';

export const fetchItems = createAsyncThunk(
  'items/fetchItems',
  async () => {
    const response = await axios.get(routes.getAllItems);
    return response.data;
  },
);

export const itemsAdapter = createEntityAdapter<Item>();

const initialState: InitialState = { loadingStatus: 'idle', error: null };

const itemsSlice = createSlice({
  name: 'items',
  initialState: itemsAdapter.getInitialState(initialState),
  reducers: {
    itemsAdd: itemsAdapter.addMany,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loadingStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, { payload }:
        PayloadAction<{ code: number, items: Item[] }>) => {
        if (payload.code === 1) {
          itemsAdapter.addMany(state, payload.items);
        }
        state.loadingStatus = 'finish';
        state.error = null;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loadingStatus = 'failed';
        state.error = action.error.message ?? null;
      });
  },
});

export const { itemsAdd } = itemsSlice.actions;

export const selectors = itemsAdapter.getSelectors<RootState>((state) => state.items);

export default itemsSlice.reducer;
