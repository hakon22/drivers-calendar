import { configureStore } from '@reduxjs/toolkit';
import itemsReducer from './itemsSlice';
import loginReducer from './loginSlice';

const store = configureStore({
  reducer: {
    login: loginReducer,
    items: itemsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
