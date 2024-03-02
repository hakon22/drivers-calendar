import { io } from 'socket.io-client';
import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '@/utilities/hooks';
import useErrorHandler from '@/utilities/useErrorHandler';
import type { ModalShowType, ModalCloseType } from '@/types/Modal';
import routes from '@/routes';
import { removeToken } from '@/slices/loginSlice';
import useAuthHandler from '@/utilities/useAuthHandler';
import {
  ApiContext, AuthContext, ModalContext, ScrollContext,
} from './Context';

const storageKey = process.env.NEXT_PUBLIC_STORAGE_KEY ?? '';

const App = ({ children }: { children: JSX.Element }) => {
  const dispatch = useAppDispatch();

  const [isLoaded, setIsLoaded] = useState(false);

  const {
    id, token, refreshToken, error,
  } = useAppSelector((state) => state.login);

  const [loggedIn, setLoggedIn] = useState(false);
  const logIn = () => setLoggedIn(true);
  const logOut = useCallback(async () => {
    const refreshTokenStorage = window.localStorage.getItem(storageKey);
    if (refreshTokenStorage) {
      localStorage.removeItem(storageKey);
    }
    await axios.post(routes.logout, { id, refreshToken });
    dispatch(removeToken());
    setLoggedIn(false);
  }, [id]);

  const [show, setShow] = useState<ModalShowType>(false);
  const modalClose = (arg?: ModalCloseType) => setShow(arg || false);
  const modalShow = (arg?: ModalShowType) => setShow(arg || false);

  const scrollPx = () => window.innerWidth - document.body.clientWidth;

  const [scrollBar, setScrollBar] = useState(0);
  const setMarginScroll = () => {
    const px = scrollPx();
    if (px) {
      setScrollBar(px - 1);
    } else {
      setScrollBar(px);
    }
  };

  const authServices = useMemo(() => ({ loggedIn, logIn, logOut }), [loggedIn, logOut]);
  const modalServices = useMemo(() => ({ show, modalShow, modalClose }), [show, modalClose]);
  const scrollServices = useMemo(() => ({ scrollBar, setMarginScroll }), [scrollBar, setMarginScroll]);

  useErrorHandler(error);
  useAuthHandler(token, refreshToken);

  const socket = io(process.env.NODE_ENV === 'development' ? '' : process.env.NEXT_PUBLIC_SOCKET_HOST ?? '');

  const socketConnect = useCallback((param: string, arg: unknown) => {
    socket.emit(param, arg);
  }, [socket]);

  const socketApi = useMemo(() => ({
    test: (data: unknown) => socketConnect('test', data),
  }), [socketConnect]);

  // socket.on('test', (data) => dispatch(test(data)));

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <ApiContext.Provider value={socketApi}>
      <AuthContext.Provider value={authServices}>
        <ModalContext.Provider value={modalServices}>
          <ScrollContext.Provider value={scrollServices}>
            {isLoaded ? (
              <div className="container">
                {children}
              </div>
            ) : (
              <div className="spinner">
                <Spinner animation="border" variant="primary" role="status" />
              </div>
            )}
          </ScrollContext.Provider>
        </ModalContext.Provider>
      </AuthContext.Provider>
    </ApiContext.Provider>
  );
};

export default App;
