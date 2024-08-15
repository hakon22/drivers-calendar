/* eslint-disable no-underscore-dangle */
import axios from 'axios';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import PaginationInterface from '@/types/PaginationInterface';
import { UserProfileType } from '@/types/User';
import type { CrewInitialState } from '../types/Crew';
import routes from '../routes';
import { CrewModel } from '../../server/db/tables/Crews';
import { ScheduleSchemaType } from '../../server/types/crew/ScheduleSchemaType';
import { CarModel } from '../../server/db/tables/Cars';
import { ReservedDaysModel } from '../../server/db/tables/ReservedDays';
import { ChatMessagesModel } from '../../server/db/tables/ChatMessages';
import SeasonEnum from '../../server/types/crew/enum/SeasonEnum';
import { CompletedShiftsModel } from '../../server/db/tables/CompletedShifts';
import { UserModel } from '../../server/db/tables/Users';

type KeysCrewInitialState = keyof CrewInitialState;

export const fetchCrew = createAsyncThunk(
  'crew/fetchCrew',
  async (id?: number) => {
    const response = await axios.get(routes.fetchCrew, {
      params: { id },
    });
    return response.data;
  },
);

export const fetchChatMessages = createAsyncThunk(
  'crew/fetchChatMessages',
  async (offset: number) => {
    const response = await axios.get(routes.fetchChatMessages, {
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
  completedShifts: [],
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
    removeToken: (state) => {
      const entries = Object.keys(state) as KeysCrewInitialState[];
      entries.forEach((key) => {
        if (key !== 'loadingStatus' && key !== 'error') {
          delete state[key];
          state[key] = initialState[key];
        }
      });
    },
    addCrew: (state, { payload }: PayloadAction<CrewModel>) => {
      const entries = Object.entries(payload);
      entries.forEach(([key, value]) => {
        state[key] = value;
      });
    },
    socketMakeSchedule: (state, { payload }: PayloadAction<{ code: number, scheduleSchema: ScheduleSchemaType, shiftOrder?: number[], reservedDays: ReservedDaysModel[], _crewId: number }>) => {
      if (state?.id && state.id === payload._crewId) {
        state.schedule_schema = payload.scheduleSchema;
        if (payload?.shiftOrder) {
          state.shiftOrder = payload.shiftOrder;
        }
        if (payload?.reservedDays) {
          state.reservedDays = payload.reservedDays;
        }
      }
    },
    socketSwipShift: (state, { payload }: PayloadAction<{ firstShift: ScheduleSchemaType, secondShift: ScheduleSchemaType, _crewId: number }>) => {
      if (state?.id && state.id === payload._crewId) {
        const { firstShift, secondShift } = payload;
        state.schedule_schema = { ...state.schedule_schema, ...firstShift, ...secondShift };
      }
    },
    socketActiveCarsUpdate: (state, { payload }: PayloadAction<{ code: number, activeCar: number, _crewId: number }>) => {
      if (state?.id && state.id === payload._crewId) {
        state.activeCar = payload.activeCar;
      }
    },
    socketCarUpdate: (state, { payload }: PayloadAction<{ code: number, car: CarModel, _crewId: number }>) => {
      if (state?.id && state.id === payload._crewId) {
        state.cars = [...state.cars.filter((car) => car.id !== payload.car.id), payload.car];
      }
    },
    socketCarAdd: (state, { payload }: PayloadAction<{ code: number, car: CarModel, _crewId: number }>) => {
      if (state?.id && state.id === payload._crewId) {
        state.cars = [...state.cars, payload.car];
      }
    },
    socketCarRemove: (state, { payload }: PayloadAction<{ code: number, carId: number, _crewId: number }>) => {
      if (state?.id && state.id === payload._crewId) {
        state.cars = state.cars.filter((car) => car.id !== +payload.carId);
      }
    },
    socketSendMessageToChat: (state, { payload }: PayloadAction<{ code: number, message: ChatMessagesModel }>) => {
      if (state?.id) {
        state.chat = [...state.chat, payload.message];
      }
    },
    socketChangeIsRoundFuel: (state, { payload }: PayloadAction<{ code: number, isRoundFuelConsumption: boolean, _crewId: number }>) => {
      if (state?.id && state.id === payload._crewId) {
        state.isRoundFuelConsumption = payload.isRoundFuelConsumption;
      }
    },
    socketChangeFuelSeason: (state, { payload }: PayloadAction<{ code: number, season: SeasonEnum, _crewId: number }>) => {
      if (state?.id && state.id === payload._crewId) {
        state.season = payload.season;
      }
    },
    socketCompletedShift: (state, { payload }: PayloadAction<CompletedShiftsModel>) => {
      if (state?.id && state.id === payload.crewId) {
        state.completedShifts = [...state.completedShifts, payload];
      }
    },
    socketKickReplacement: (state, { payload }: PayloadAction<{ code: number, userId: number, _crewId: number }>) => {
      if (state?.id && state.id === payload._crewId) {
        state.users = state.users.filter((user) => user.id !== payload.userId);
      }
    },
    socketAddUserInCrew: (state, { payload }: PayloadAction<{ code: number, user: UserModel, _crewId: number }>) => {
      if (state?.id && state.id === payload._crewId) {
        state.users = [...state.users, payload.user];
      }
    },
    socketUserProfileUpdateCrew: (state, { payload }: PayloadAction<{ code: number, id: number, values: UserProfileType, _crewId: number }>) => {
      if (state?.id && state.id === payload._crewId) {
        const { username, phone, color } = payload.values;
        if (username || color || phone) {
          state.users = state.users.map((user) => {
            if (user.id === payload.id) {
              if (username) {
                user.username = payload.values.username as string;
              }
              if (color) {
                user.color = payload.values.color as string;
              }
              if (phone) {
                user.phone = payload.values.phone as string;
              }
            }
            return user;
          });
        }
      }
    },
    readChatMessages: (state, { payload }: PayloadAction<{ userId: number }>) => {
      if (state?.id) {
        state.chat = state.chat.map((message) => {
          if (!message.readBy.includes(payload.userId)) {
            message.readBy.push(payload.userId);
            return message;
          }
          return message;
        });
      }
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
  readChatMessages, removeToken, socketChangeFuelSeason, socketChangeIsRoundFuel, socketUserProfileUpdateCrew, socketCompletedShift,
  socketKickReplacement, socketAddUserInCrew, addCrew,
} = crewSlice.actions;

export default crewSlice.reducer;
