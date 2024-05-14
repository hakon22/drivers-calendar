import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import crewReducer from './crewSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    crew: crewReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
