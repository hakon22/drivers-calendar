import axios from 'axios';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import PaginationInterface from '@/types/PaginationInterface';
import type { CrewInitialState } from '../types/Crew';
import routes from '../routes';
import { CrewModel } from '../../server/db/tables/Crews';
import { ScheduleSchemaType } from '../../server/types/crew/ScheduleSchemaType';
import { CarModel } from '../../server/db/tables/Cars';
import { ReservedDaysModel } from '../../server/db/tables/ReservedDays';
import { ChatMessagesModel } from '../../server/db/tables/ChatMessages';

export const fetchCrew = createAsyncThunk(
  'crew/fetchCrew',
  async (token?: string) => {
    const response = await axios.get(routes.fetchCrew, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
);

export const fetchChatMessages = createAsyncThunk(
  'crew/fetchChatMessages',
  async ({ token, offset }: { token?: string, offset: number }) => {
    const response = await axios.get(routes.fetchChatMessages, {
      headers: { Authorization: `Bearer ${token}` },
      params: { offset },
    });
    return response.data;
  },
);

export const initialState: { [K in keyof CrewInitialState]: CrewInitialState[K] } = {
  loadingStatus: 'idle',
  error: null,
  users: [],
  cars: [],
  schedule_schema: {},
  shiftOrder: [],
  reservedDays: [],
  chat: [],
  activeCar: null,
  pagination: {
    limit: 0,
    offset: 0,
    count: 0,
    current: 0,
    total: 0,
  },
};

const crewSlice = createSlice({
  name: 'crew',
  initialState,
  reducers: {
    socketMakeSchedule: (state, { payload }: PayloadAction<{ code: number, scheduleSchema: ScheduleSchemaType, shiftOrder?: number[], reservedDays: ReservedDaysModel[] }>) => {
      if (payload.code === 1) {
        state.schedule_schema = payload.scheduleSchema;
        if (payload?.shiftOrder) {
          state.shiftOrder = payload.shiftOrder;
        }
        if (payload?.reservedDays) {
          state.reservedDays = payload.reservedDays;
        }
      }
    },
    socketSwipShift: (state, { payload }: PayloadAction<{ firstShift: ScheduleSchemaType, secondShift: ScheduleSchemaType }>) => {
      const { firstShift, secondShift } = payload;
      state.schedule_schema = { ...state.schedule_schema, ...firstShift, ...secondShift };
    },
    socketActiveCarsUpdate: (state, { payload }: PayloadAction<{ code: number, activeCar: number }>) => {
      if (payload.code === 1) {
        state.activeCar = payload.activeCar;
      }
    },
    socketCarUpdate: (state, { payload }: PayloadAction<{ code: number, car: CarModel }>) => {
      if (payload.code === 1) {
        state.cars = [...state.cars.filter((car) => car.id !== payload.car.id), payload.car];
      }
    },
    socketCarAdd: (state, { payload }: PayloadAction<{ code: number, car: CarModel }>) => {
      if (payload.code === 1) {
        state.cars = [...state.cars, payload.car];
      }
    },
    socketCarRemove: (state, { payload }: PayloadAction<{ code: number, carId: number }>) => {
      if (payload.code === 1) {
        state.cars = state.cars.filter((car) => car.id !== +payload.carId);
      }
    },
    socketSendMessageToChat: (state, { payload }: PayloadAction<{ code: number, message: ChatMessagesModel }>) => {
      if (payload.code === 1) {
        state.chat = [...state.chat, payload.message];
      }
    },
    readChatMessages: (state, { payload }: PayloadAction<{ userId: number }>) => {
      state.chat = state.chat.map((message) => {
        if (!message.readBy.includes(payload.userId)) {
          message.readBy.push(payload.userId);
          return message;
        }
        return message;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCrew.pending, (state) => {
        state.loadingStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchCrew.fulfilled, (state, { payload }
        : PayloadAction<{ code: number, crew: CrewModel }>) => {
        if (payload.code === 1) {
          const entries = Object.entries(payload.crew);
          entries.forEach(([key, value]) => { state[key] = value; });
          state.pagination.offset = state.chat.length;
          state.pagination.current = state.chat.length;
          state.pagination.count = state.chat.length;
        }
        state.loadingStatus = 'finish';
        state.error = null;
      })
      .addCase(fetchCrew.rejected, (state, action) => {
        state.loadingStatus = 'failed';
        state.error = action.error.message ?? null;
      })
      .addCase(fetchChatMessages.pending, (state) => {
        state.loadingStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, { payload }
        : PayloadAction<PaginationInterface<ChatMessagesModel> & { code: number }>) => {
        const {
          code, rows, count, limit, total,
        } = payload;
        if (code === 1) {
          state.chat = [...rows, ...state.chat];
          state.pagination.current += count;
          state.pagination.count = count;
          state.pagination.offset += count;
          state.pagination.limit = limit;
          state.pagination.total = total;
        }
        state.loadingStatus = 'finish';
        state.error = null;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.loadingStatus = 'failed';
        state.error = action.error.message ?? null;
      });
  },
});

export const {
  socketMakeSchedule, socketActiveCarsUpdate, socketCarUpdate, socketCarAdd, socketCarRemove, socketSwipShift, socketSendMessageToChat,
  readChatMessages,
} = crewSlice.actions;

export default crewSlice.reducer;
