import { useEffect, useContext } from 'react';
import { fetchTokenStorage, updateTokens } from '@/slices/userSlice';
import { AuthContext } from '@/components/Context';
import { useAppDispatch } from './hooks';

const useAuthHandler = (token?: string, refreshToken?: string) => {
  const dispatch = useAppDispatch();
  const { logIn } = useContext(AuthContext);

  useEffect(() => {
    const tokenStorage = window.localStorage.getItem(process.env.STORAGE_KEY ?? '');
    if (tokenStorage) {
      dispatch(fetchTokenStorage(tokenStorage));
    }
  }, []);

  useEffect(() => {
    if (token) {
      logIn();
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
