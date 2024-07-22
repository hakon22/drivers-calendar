import { useEffect, useContext } from 'react';
import { fetchTokenStorage, updateTokens } from '@/slices/userSlice';
import { AuthContext } from '@/components/Context';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from './hooks';

const storageKey = process.env.NEXT_PUBLIC_STORAGE_KEY ?? '';

const useAuthHandler = () => {
  const dispatch = useAppDispatch();
  const { logIn, loggedIn } = useContext(AuthContext);
  const { token, refreshToken } = useAppSelector((state) => state.user);

  useEffect(() => {
    const tokenStorage = window.localStorage.getItem(storageKey);
    if (tokenStorage) {
      dispatch(fetchTokenStorage(tokenStorage));
    }
  }, []);

  useEffect(() => {
    if (token && !loggedIn) {
      logIn();
    }
    if (token) {
      axios.interceptors.request.use((config) => {
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      });
    }
  }, [token]);

  useEffect(() => {
    if (refreshToken) {
      const fetch = () => dispatch(updateTokens(refreshToken));

      const timeAlive = setTimeout(fetch, 595000);
      return () => clearTimeout(timeAlive);
    }
    return undefined;
  }, [refreshToken]);
};

export default useAuthHandler;
