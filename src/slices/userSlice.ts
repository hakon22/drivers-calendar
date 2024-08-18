/* eslint-disable no-param-reassign */
import axios from 'axios';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { User, UserInitialState, UserProfileType } from '../types/User';
import routes from '../routes';
import { UpdateNoticeModel } from '../../server/db/tables/UpdateNotice';

type KeysUserInitialState = keyof UserInitialState;

const storageKey = process.env.NEXT_PUBLIC_STORAGE_KEY ?? '';

export const fetchLogin = createAsyncThunk(
  'user/fetchLogin',
  async (data: { phone: string, password: string }) => {
    const response = await axios.post(routes.login, data);
    return response.data;
  },
);

export const fetchInviteSignup = createAsyncThunk(
  'user/fetchInviteSignup',
  async (data: { color: string, username: string, temporaryToken: string }) => {
    const { temporaryToken, ...body } = data;
    const response = await axios.post(routes.inviteSignup, body, {
      headers: { Authorization: `Bearer ${temporaryToken}` },
    });
    return response.data;
  },
);

export const fetchAcceptInvitation = createAsyncThunk(
  'user/fetchAcceptInvitation',
  async (id: number) => {
    const response = await axios.post(routes.acceptInvitation, { id });
    return response.data;
  },
);

export const fetchConfirmCode = createAsyncThunk(
  'user/fetchConfirmCode',
  async (data: { phone: string, key?: string, code?: string }) => {
    const response = await axios.post(routes.confirmPhone, data);
    return response.data;
  },
);

export const fetchTokenStorage = createAsyncThunk(
  'user/fetchTokenStorage',
  async (refreshTokenStorage: string) => {
    const response = await axios.get(routes.updateTokens, {
      headers: { Authorization: `Bearer ${refreshTokenStorage}` },
    });
    return response.data;
  },
);

export const fetchUpdates = createAsyncThunk(
  'user/fetchUpdates',
  async () => {
    const response = await axios.get(routes.fetchUpdates);
    return response.data;
  },
);

export const updateTokens = createAsyncThunk(
  'user/updateTokens',
  async (refresh: string | undefined) => {
    const refreshTokenStorage = window.localStorage.getItem(storageKey);
    if (refreshTokenStorage) {
      const { data } = await axios.get(routes.updateTokens, {
        headers: { Authorization: `Bearer ${refreshTokenStorage}` },
      });
      if (data.user.refreshToken) {
        window.localStorage.setItem(storageKey, data.user.refreshToken);
        return data;
      }
    } else {
      const { data } = await axios.get(routes.updateTokens, {
        headers: { Authorization: `Bearer ${refresh}` },
      });
      if (data.user.refreshToken) {
        return data;
      }
    }
    return null;
  },
);

export const readUpdates = createAsyncThunk(
  'user/readUpdate',
  async (id: number) => {
    const response = await axios.get(`${routes.readUpdates}/${id}`);
    return response.data;
  },
);

export const initialState: { [K in keyof UserInitialState]: UserInitialState[K] } = {
  loadingStatus: 'idle',
  error: null,
  updatesNotice: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    removeToken: (state) => {
      const entries = Object.keys(state) as KeysUserInitialState[];
      entries.forEach((key) => {
        if (key !== 'loadingStatus' && key !== 'error') {
          delete state[key];
        }
        if (state?.updatesNotice?.length) {
          state.updatesNotice = [];
        }
      });
    },
    removeTelegramId: (state) => {
      if (state?.telegramId) {
        state.telegramId = null;
      }
    },
    socketUserProfileUpdate: (state, { payload }: PayloadAction<{ code: number, values: UserProfileType }>) => {
      const {
        phone, username, color, isRoundCalendarDays,
      } = payload.values;
      if (phone) {
        state.phone = phone as string;
        if (state?.key) {
          delete state.key;
        }
      }
      if (username) {
        state.username = username as string;
      }
      if (color) {
        state.color = color as string;
      }
      if (isRoundCalendarDays !== undefined) {
        state.isRoundCalendarDays = isRoundCalendarDays as boolean;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogin.pending, (state) => {
        state.loadingStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchLogin.fulfilled, (state, { payload }
        : PayloadAction<{ code: number, user: User, crew?: { users: string, cars: string }, temporaryToken?: string }>) => {
        if (payload.code === 1) {
          const entries = Object.entries(payload.user);
          entries.forEach(([key, value]) => { state[key] = value; });
          window.localStorage.setItem(storageKey, payload.user.refreshToken);
        }
        if (payload.code === 4 && payload.crew && payload.temporaryToken) {
          state.users = payload.crew.users;
          state.cars = payload.crew.cars;
          state.temporaryToken = payload.temporaryToken;
        }
        state.loadingStatus = 'finish';
        state.error = null;
      })
      .addCase(fetchLogin.rejected, (state, action) => {
        state.loadingStatus = 'failed';
        state.error = action.error.message ?? null;
      })
      .addCase(fetchInviteSignup.pending, (state) => {
        state.loadingStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchInviteSignup.fulfilled, (state, { payload }
        : PayloadAction<{ code: number, user: User }>) => {
        if (payload.code === 1) {
          if (state.users && state.cars && state.temporaryToken) {
            delete state.users;
            delete state.cars;
            delete state.temporaryToken;
          }
          const entries = Object.entries(payload.user);
          entries.forEach(([key, value]) => { state[key] = value; });
          window.localStorage.setItem(storageKey, payload.user.refreshToken);
        }
        state.loadingStatus = 'finish';
        state.error = null;
      })
      .addCase(fetchInviteSignup.rejected, (state, action) => {
        state.loadingStatus = 'failed';
        state.error = action.error.message ?? null;
      })
      .addCase(fetchTokenStorage.pending, (state) => {
        state.loadingStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchTokenStorage.fulfilled, (state, { payload }
        : PayloadAction<{ code: number, user: User }>) => {
        if (payload.code === 1) {
          if (window.localStorage.getItem(storageKey)) {
            window.localStorage.setItem(storageKey, payload.user.refreshToken);
          }
          const entries = Object.entries(payload.user);
          entries.forEach(([key, value]) => { state[key] = value; });
        }
        state.loadingStatus = 'finish';
        state.error = null;
      })
      .addCase(fetchTokenStorage.rejected, (state, action) => {
        state.loadingStatus = 'failed';
        state.error = action.error.message ?? null;
        window.localStorage.removeItem(storageKey);
      })
      .addCase(updateTokens.pending, (state) => {
        state.loadingStatus = 'loading';
        state.error = null;
      })
      .addCase(updateTokens.fulfilled, (state, { payload }
        : PayloadAction<{ code: number, user: User }>) => {
        if (payload.code === 1) {
          const entries = Object.entries(payload.user);
          entries.forEach(([key, value]) => { state[key] = value; });
        }
        state.loadingStatus = 'finish';
        state.error = null;
      })
      .addCase(updateTokens.rejected, (state, action) => {
        state.loadingStatus = 'failed';
        state.error = action.error.message ?? null;
        window.localStorage.removeItem(storageKey);
      })
      .addCase(fetchConfirmCode.pending, (state) => {
        state.loadingStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchConfirmCode.fulfilled, (state, { payload }
        : PayloadAction<{ code: number, key: string, phone: string }>) => {
        if (payload.code === 1) {
          state.key = payload.key;
          if (!state.id) {
            state.phone = payload.phone;
          }
        }
        state.loadingStatus = 'finish';
        state.error = null;
      })
      .addCase(fetchConfirmCode.rejected, (state, action) => {
        state.loadingStatus = 'failed';
        state.error = action.error.message ?? null;
      })
      .addCase(fetchAcceptInvitation.pending, (state) => {
        state.loadingStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchAcceptInvitation.fulfilled, (state, { payload }
        : PayloadAction<{ code: number, crewId: number }>) => {
        if (payload.code === 1) {
          state.crewId = payload.crewId;
        }
        state.loadingStatus = 'finish';
        state.error = null;
      })
      .addCase(fetchAcceptInvitation.rejected, (state, action) => {
        state.loadingStatus = 'failed';
        state.error = action.error.message ?? null;
      })
      .addCase(fetchUpdates.pending, (state) => {
        state.loadingStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchUpdates.fulfilled, (state, { payload }
        : PayloadAction<{ code: number, updates: UpdateNoticeModel[] }>) => {
        if (payload.code === 1) {
          state.updatesNotice = payload.updates;
        }
        state.loadingStatus = 'finish';
        state.error = null;
      })
      .addCase(fetchUpdates.rejected, (state, action) => {
        state.loadingStatus = 'failed';
        state.error = action.error.message ?? null;
      })
      .addCase(readUpdates.pending, (state) => {
        state.loadingStatus = 'loading';
        state.error = null;
      })
      .addCase(readUpdates.fulfilled, (state, { payload }
        : PayloadAction<{ code: number, updateId: number }>) => {
        if (payload.code === 1) {
          state.updatesNotice = (state?.updatesNotice as UpdateNoticeModel[])?.filter((update) => update.id !== payload.updateId);
        }
        state.loadingStatus = 'finish';
        state.error = null;
      })
      .addCase(readUpdates.rejected, (state, action) => {
        state.loadingStatus = 'failed';
        state.error = action.error.message ?? null;
      });
  },
});

export const { removeToken, removeTelegramId, socketUserProfileUpdate } = userSlice.actions;

export default userSlice.reducer;
