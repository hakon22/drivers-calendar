/* eslint-disable no-param-reassign */
import axios from 'axios';
import {
  createSlice, createAsyncThunk, createEntityAdapter, PayloadAction,
} from '@reduxjs/toolkit';
import type { NotificationInitialState, Notification } from '../types/Notification';
import routes from '../routes';
import type { RootState } from './index';

export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (token?: string) => {
    const response = await axios.get(routes.fetchNotifications, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
);

export const notificationAdapter = createEntityAdapter<Notification>();

export const initialState: { [K in keyof NotificationInitialState]: NotificationInitialState[K] } = {
  loadingStatus: 'idle',
  error: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState: notificationAdapter.getInitialState(initialState),
  reducers: {
    notificationAdd: notificationAdapter.addOne,
    notificationRemove: notificationAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loadingStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, { payload }
        : PayloadAction<{ code: number, notifications: Notification[] }>) => {
        if (payload.code === 1) {
          notificationAdapter.addMany(state, payload.notifications);
        }
        state.loadingStatus = 'finish';
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loadingStatus = 'failed';
        state.error = action.error.message ?? null;
      });
  },
});

export const { notificationAdd, notificationRemove } = notificationSlice.actions;
export const selectors = notificationAdapter.getSelectors<RootState>((state) => state.notification);

export default notificationSlice.reducer;
