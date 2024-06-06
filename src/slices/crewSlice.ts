import axios from 'axios';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { CrewInitialState } from '../types/Crew';
import routes from '../routes';
import { CrewModel } from '../../server/db/tables/Crews';
import { ScheduleSchemaType } from '../../server/types/crew/ScheduleSchemaType';

export const fetchCrew = createAsyncThunk(
  'crew/fetchCrew',
  async (token?: string) => {
    const response = await axios.get(routes.fetchCrew, {
      headers: { Authorization: `Bearer ${token}` },
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
  activeCar: null,
};

const crewSlice = createSlice({
  name: 'crew',
  initialState,
  reducers: {
    socketMakeSchedule: (state, { payload }: PayloadAction<{ code: number, scheduleSchema: ScheduleSchemaType }>) => {
      if (payload.code === 1) {
        state.schedule_schema = payload.scheduleSchema;
      }
    },
    socketActiveCarsUpdate: (state, { payload }: PayloadAction<{ code: number, activeCar: number }>) => {
      if (payload.code === 1) {
        state.activeCar = payload.activeCar;
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
        }
        state.loadingStatus = 'finish';
        state.error = null;
      })
      .addCase(fetchCrew.rejected, (state, action) => {
        state.loadingStatus = 'failed';
        state.error = action.error.message ?? null;
      });
  },
});

export const {
  socketMakeSchedule, socketActiveCarsUpdate,
} = crewSlice.actions;

export default crewSlice.reducer;
